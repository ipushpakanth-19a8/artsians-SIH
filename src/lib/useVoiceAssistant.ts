import { useState, useRef, useEffect, useCallback } from 'react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGE_CONFIGS } from '../config/languages';
import { parseUserVoiceIntent, VoiceIntent, ParseIntentResult } from './useVoiceForm';

export type VoiceState =
  | 'IDLE'
  | 'SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'CONFIRMING'
  | 'CORRECTING'
  | 'SAVED'
  | 'COMPLETED'
  | 'ERROR';

export interface UseVoiceAssistantOptions {
  language?: LanguageCode;
  currentField?: string;
  onTranscript?: (transcript: string) => void;
  onError?: (err: string) => void;
  enableDebugLogs?: boolean;
}

export interface VoiceAssistantHook {
  state: VoiceState;
  isSpeaking: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  currentText: string;
  micPermissionDenied: boolean;
  isSupported: boolean;
  language: LanguageCode;
  locale: string;
  speak: (text: string, langOrOnEnd?: LanguageCode | (() => void), onEnd?: () => void) => void;
  listen: (onResult: (result: ParseIntentResult) => void) => void;
  stopAll: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  setState: (state: VoiceState) => void;
}

export function useVoiceAssistant(
  optionsOrLang: LanguageCode | UseVoiceAssistantOptions = {}
): VoiceAssistantHook {
  const options: UseVoiceAssistantOptions =
    typeof optionsOrLang === 'string' ? { language: optionsOrLang } : optionsOrLang;

  const {
    language = 'en',
    currentField = 'general',
    onTranscript,
    onError,
    enableDebugLogs = process.env.NODE_ENV !== 'production',
  } = options;

  const [state, setState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [currentText, setCurrentText] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const langConfig = SUPPORTED_LANGUAGE_CONFIGS[language] || SUPPORTED_LANGUAGE_CONFIGS.en;
  const locale = langConfig.recognitionLocale || 'en-IN';
  const speechLocale = langConfig.speechLocale || 'en-IN';

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const onResultCallbackRef = useRef<((result: ParseIntentResult) => void) | null>(null);
  const timeoutIdRef = useRef<any>(null);

  const logVoice = useCallback(
    (action: string, meta: Record<string, any> = {}) => {
      if (!enableDebugLogs) return;
      console.log(`[VOICE] action=${action} state=${state} field=${currentField} lang=${language} locale=${locale}`, meta);
    },
    [enableDebugLogs, state, currentField, language, locale]
  );

  // Initialize browser speech capabilities
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis || null;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }

    return () => {
      stopAll();
    };
  }, []);

  // Strict Stop All
  const stopAll = useCallback(() => {
    logVoice('cleanup/stopAll');
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        // Safe catch
      }
    }

    if (recognitionRef.current && isListeningRef.current) {
      try {
        isListeningRef.current = false;
        recognitionRef.current.stop();
      } catch (e) {
        // Safe catch
      }
    }

    setState('IDLE');
    setIsPaused(false);
  }, [logVoice]);

  // TTS Engine: Speaks text, then triggers optional callback (CRITICAL: Microphones must never start until TTS ends)
  const speak = useCallback(
    (text: string, langOrOnEnd?: LanguageCode | (() => void), onEndCallback?: () => void) => {
      if (!text || typeof window === 'undefined') return;

      let targetLang = language;
      let callback = onEndCallback;
      if (typeof langOrOnEnd === 'function') {
        callback = langOrOnEnd;
      } else if (typeof langOrOnEnd === 'string') {
        targetLang = langOrOnEnd;
      }

      const targetConfig = SUPPORTED_LANGUAGE_CONFIGS[targetLang] || langConfig;
      const targetSpeechLocale = targetConfig.speechLocale || speechLocale;

      // 1. Ensure any ongoing speech or recognition is stopped
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        isListeningRef.current = false;
      }

      setCurrentText(text);
      setIsPaused(false);
      setState('SPEAKING');
      logVoice('TTS start', { text: text.slice(0, 50) });

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;
      utterance.lang = targetSpeechLocale;
      utterance.rate = 0.95; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      // Match regional voice if available
      if (synthRef.current && 'getVoices' in synthRef.current) {
        const voices = synthRef.current.getVoices();
        const matchedVoice = voices.find((v) => v.lang === targetSpeechLocale || v.lang.startsWith(targetLang));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onend = () => {
        logVoice('TTS end');
        activeUtteranceRef.current = null;
        setState('IDLE');
        if (callback) {
          callback();
        }
      };

      utterance.onerror = (event) => {
        logVoice('error', { type: 'TTS error', event });
        activeUtteranceRef.current = null;
        setState('ERROR');
        if (callback) {
          callback();
        }
      };

      // Speak utterance safely
      try {
        if (synthRef.current?.paused) {
          synthRef.current.resume();
        }
        synthRef.current?.speak(utterance);
      } catch (err) {
        logVoice('error', { type: 'TTS speak failure', err });
        setState('ERROR');
        if (callback) callback();
      }
    },
    [language, langConfig, speechLocale, logVoice]
  );

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const replay = useCallback(() => {
    if (currentText) {
      speak(currentText);
    }
  }, [currentText, speak]);

  // STT Engine: Listens for user voice
  const listen = useCallback(
    (onResult: (result: ParseIntentResult) => void) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        onError?.('Speech recognition is not supported in this browser.');
        return;
      }

      // Ensure synthesizer is not speaking
      if (synthRef.current?.speaking) {
        synthRef.current.cancel();
      }

      onResultCallbackRef.current = onResult;
      setTranscript('');
      setInterimTranscript('');

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = locale;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          isListeningRef.current = true;
          setState('LISTENING');
          logVoice('recognition start');

          // 12s no-speech recognition timeout guard
          timeoutIdRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              logVoice('recognition timeout');
              try {
                recognition.stop();
              } catch (e) {}
            }
          }, 12000);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const part = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += part;
            } else {
              currentInterim += part;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }

          if (currentFinal) {
            logVoice('recognition result', { currentFinal });
            setTranscript(currentFinal);
            setInterimTranscript('');
            onTranscript?.(currentFinal);

            setState('PROCESSING');
            const parsed = parseUserVoiceIntent(currentFinal, language);
            logVoice('parsed value', { intent: parsed.intent, value: parsed.cleanedValue });

            if (onResultCallbackRef.current) {
              onResultCallbackRef.current(parsed);
              onResultCallbackRef.current = null;
            }
          }
        };

        recognition.onerror = (event: any) => {
          logVoice('recognition error', { error: event?.error });
          isListeningRef.current = false;

          if (event?.error === 'not-allowed') {
            setMicPermissionDenied(true);
            onError?.('Microphone permission denied. Please allow microphone access.');
          } else if (event?.error === 'no-speech') {
            // No speech captured: stay on same question gracefully
            logVoice('no-speech handling');
          }

          setState('ERROR');
        };

        recognition.onend = () => {
          logVoice('recognition end');
          isListeningRef.current = false;
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
        };

        recognition.start();
      } catch (err: any) {
        logVoice('error', { type: 'recognition start exception', err });
        isListeningRef.current = false;
        setState('ERROR');
        onError?.(err?.message || 'Failed to start speech recognition');
      }
    },
    [locale, language, logVoice, onTranscript, onError]
  );

  return {
    state,
    isSpeaking: state === 'SPEAKING',
    isPlaying: state === 'SPEAKING',
    isPaused,
    isListening: state === 'LISTENING',
    transcript,
    interimTranscript,
    currentText,
    micPermissionDenied,
    isSupported,
    language,
    locale,
    speak,
    listen,
    stopAll,
    stop: stopAll,
    pause,
    resume,
    replay,
    setState,
  };
}
