import { useState, useRef, useEffect, useCallback } from 'react';
import { LanguageCode } from '../types';
import {
  MULTILINGUAL_YES_WORDS,
  MULTILINGUAL_NO_WORDS,
  MULTILINGUAL_REPEAT_WORDS,
  MULTILINGUAL_GO_BACK_WORDS,
} from '../i18n/voiceForm.i18n';
import { SUPPORTED_LANGUAGE_CONFIGS } from '../config/languages';

export type VoiceIntent = 'yes' | 'no' | 'repeat' | 'go_back' | 'value' | 'unknown';

export interface ParseIntentResult {
  intent: VoiceIntent;
  raw: string;
  cleanedValue: string;
}

export function parseUserVoiceIntent(rawTranscript: string, lang: LanguageCode): ParseIntentResult {
  const raw = rawTranscript.trim();
  if (!raw) return { intent: 'unknown', raw: '', cleanedValue: '' };

  // Normalize: lower case, strip basic punctuation
  const clean = raw.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"!?]/g, '').trim();

  // Helper for matching tokens or full string
  const matchesAny = (wordList: string[] = []) => {
    return wordList.some((w) => {
      const target = w.toLowerCase().trim();
      return clean === target || clean.startsWith(target + ' ') || clean.endsWith(' ' + target) || clean.includes(' ' + target + ' ');
    });
  };

  const yesList = [
    ...(MULTILINGUAL_YES_WORDS[lang] || []),
    ...(MULTILINGUAL_YES_WORDS.en || []),
  ];
  if (matchesAny(yesList)) {
    return { intent: 'yes', raw, cleanedValue: '' };
  }

  const noList = [
    ...(MULTILINGUAL_NO_WORDS[lang] || []),
    ...(MULTILINGUAL_NO_WORDS.en || []),
  ];
  if (matchesAny(noList)) {
    return { intent: 'no', raw, cleanedValue: '' };
  }

  const repeatList = [
    ...(MULTILINGUAL_REPEAT_WORDS[lang] || []),
    ...(MULTILINGUAL_REPEAT_WORDS.en || []),
  ];
  if (matchesAny(repeatList)) {
    return { intent: 'repeat', raw, cleanedValue: '' };
  }

  const goBackList = [
    ...(MULTILINGUAL_GO_BACK_WORDS[lang] || []),
    ...(MULTILINGUAL_GO_BACK_WORDS.en || []),
  ];
  if (matchesAny(goBackList)) {
    return { intent: 'go_back', raw, cleanedValue: '' };
  }

  // If not a control command, treat as a spoken data value
  // Clean off conversational prefixes like "the name is", "it is", "it's"
  let cleanedValue = raw
    .replace(/^(the name is|it is|it's|name is|its|value is|price is|category is|material is|quantity is)\s+/i, '')
    .trim();

  return { intent: 'value', raw, cleanedValue };
}

export function useVoiceForm(language: LanguageCode = 'en') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isListeningRef = useRef(false);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis || null;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition || !synthRef.current) {
        setIsSupported(false);
      }
    }
  }, []);

  const stopAll = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  // Strict TTS Speaker
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        if (onEnd) onEnd();
        return;
      }

      // Stop any pending speech or recognition before starting new TTS
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      isListeningRef.current = false;
      setIsListening(false);

      window.speechSynthesis.cancel();

      const langConfig = SUPPORTED_LANGUAGE_CONFIGS[language];
      const targetLocale = langConfig?.speechLocale || 'en-IN';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLocale;
      utterance.rate = 0.95; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      // Select matching regional voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang === targetLocale || v.lang.replace('_', '-').startsWith(language)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (onEnd) onEnd();
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  // Strict STT Listener (started only after speech finishes)
  const listen = useCallback(
    (onResult: (text: string) => void) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      // If speech is still ongoing, cancel it first
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const langConfig = SUPPORTED_LANGUAGE_CONFIGS[language];
      const targetLocale = langConfig?.recognitionLocale || 'en-IN';

      const rec = new SpeechRecognition();
      rec.lang = targetLocale;
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      onResultCallbackRef.current = onResult;

      rec.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setTranscript('');
      };

      rec.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript || '';
        setTranscript(text);
        if (onResultCallbackRef.current) {
          onResultCallbackRef.current(text);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition event note:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      rec.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setIsListening(false);
        isListeningRef.current = false;
      }
    },
    [language]
  );

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    speak,
    listen,
    stopAll,
    isSpeaking,
    isListening,
    transcript,
    micPermissionDenied,
    isSupported,
  };
}
