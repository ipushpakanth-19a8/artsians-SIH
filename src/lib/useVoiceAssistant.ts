import { useState, useEffect, useCallback, useRef } from 'react';
import { LanguageCode } from '../types';

export interface VoiceAssistantState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string | null;
  speak: (text: string, lang?: LanguageCode) => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  stop: () => void;
  toggle: (text: string, lang?: LanguageCode) => void;
}

export function useVoiceAssistant(defaultLang: LanguageCode = 'en'): VoiceAssistantState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const lastTextRef = useRef<string | null>(null);
  const lastLangRef = useRef<LanguageCode>(defaultLang);

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
  }, []);

  const speak = useCallback(
    (text: string, lang: LanguageCode = defaultLang) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      if (!text || text.trim() === '') {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      lastTextRef.current = text;
      lastLangRef.current = lang;
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);

      // Best matching voice tag for Indian English, Hindi, Telugu
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (lang === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.rate = 0.92; // slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
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
      } catch (err) {
        console.error('Failed to trigger speech synthesis:', err);
        setIsPlaying(false);
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

  return {
    isPlaying,
    isPaused,
    currentText,
    speak,
    pause,
    resume,
    replay,
    stop,
    toggle,
  };
}
