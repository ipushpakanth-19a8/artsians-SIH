import { useState, useEffect, useCallback, useRef } from 'react';
import { LanguageCode } from '../types';

/** Clear voice state machine: idle → speaking ↔ paused → idle */
export type VoiceState = 'idle' | 'speaking' | 'paused';

export interface VoiceAssistantState {
  isPlaying: boolean;
  isPaused: boolean;
  /** Derived state for clearer state machine tracking */
  voiceState: VoiceState;
  currentText: string | null;
  speak: (text: string, lang?: LanguageCode, onEnd?: () => void) => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  stop: () => void;
  toggle: (text: string, lang?: LanguageCode, onEnd?: () => void) => void;
}

// ---------------------------------------------------------------------------
// Regional locale map for all 12 supported Indian languages
// ---------------------------------------------------------------------------
const REGIONAL_LOCALES: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
};

/**
 * Find the best available SpeechSynthesis voice for the given language.
 * Priority: exact locale match → language-prefix match → null (let browser default)
 */
export function getBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const targetLocale = REGIONAL_LOCALES[lang] || 'en-IN';
  const voices = window.speechSynthesis.getVoices();

  // 1. Exact locale match (e.g. 'te-IN' === 'te-IN')
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase() === targetLocale.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // 2. Language-prefix match (e.g. 'te' starts with 'te')
  const prefixMatch = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang)
  );
  if (prefixMatch) return prefixMatch;

  // 3. Fallback to en-IN if available
  if (lang !== 'en') {
    const enFallback = voices.find(
      (v) => v.lang.toLowerCase() === 'en-in'
    );
    if (enFallback) return enFallback;
  }

  return null;
}

export function useVoiceAssistant(defaultLang: LanguageCode = 'en'): VoiceAssistantState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const lastTextRef = useRef<string | null>(null);
  const lastLangRef = useRef<LanguageCode>(defaultLang);
  const onEndCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    onEndCallbackRef.current = undefined;
  }, []);

  const speak = useCallback(
    (text: string, lang: LanguageCode = defaultLang, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      if (!text || text.trim() === '') {
        setIsPlaying(false);
        setIsPaused(false);
        onEnd?.();
        return;
      }

      lastTextRef.current = text;
      lastLangRef.current = lang;
      onEndCallbackRef.current = onEnd;
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);

      // Set locale and find best matching voice
      utterance.lang = REGIONAL_LOCALES[lang] || 'en-IN';
      const bestVoice = getBestVoice(lang);
      if (bestVoice) utterance.voice = bestVoice;

      utterance.rate = 0.92; // slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        if (onEndCallbackRef.current) {
          const cb = onEndCallbackRef.current;
          onEndCallbackRef.current = undefined;
          cb();
        }
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error event:', e);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
        setIsPlaying(true);
      };

      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error('Failed to trigger speech synthesis:', err);
        setIsPlaying(false);
        onEnd?.();
      }
    },
    [defaultLang]
  );

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else if (lastTextRef.current) {
        speak(lastTextRef.current, lastLangRef.current);
      }
    }
  }, [speak]);

  const replay = useCallback(() => {
    if (lastTextRef.current) {
      speak(lastTextRef.current, lastLangRef.current);
    }
  }, [speak]);

  const toggle = useCallback(
    (text: string, lang: LanguageCode = defaultLang) => {
      if (isPlaying && !isPaused && currentText === text) {
        pause();
      } else if (isPaused && currentText === text) {
        resume();
      } else {
        speak(text, lang);
      }
    },
    [isPlaying, isPaused, currentText, pause, resume, speak, defaultLang]
  );

  // Derive clear state machine value
  const voiceState: VoiceState = isPaused ? 'paused' : isPlaying ? 'speaking' : 'idle';

  return {
    isPlaying,
    isPaused,
    voiceState,
    currentText,
    speak,
    pause,
    resume,
    replay,
    stop,
    toggle,
  };
}
