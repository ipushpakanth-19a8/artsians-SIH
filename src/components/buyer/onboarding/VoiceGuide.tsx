import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../../types';

interface VoiceGuideProps {
  spokenText: string;
  isMuted?: boolean;
  language?: LanguageCode;
  onAutoplayBlockedChange?: (blocked: boolean) => void;
  onSpeechEnd?: () => void;
}

export const VoiceGuide: React.FC<VoiceGuideProps> = ({
  spokenText,
  isMuted = false,
  language = 'en',
  onAutoplayBlockedChange,
  onSpeechEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [localMuted, setLocalMuted] = useState(isMuted);

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenRef = useRef<string>('');

  // Find best available voice based on selected language
  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      return voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi')) || null;
    }
    if (language === 'te') {
      return voices.find((v) => v.lang === 'te-IN' || v.lang.startsWith('te')) || null;
    }
    return (
      voices.find((v) => v.lang === 'en-IN' || v.name.includes('India')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }, [language]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (localMuted || !text || text.trim() === '') {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      window.speechSynthesis.cancel();
      lastSpokenRef.current = text;

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      const preferredVoice = getPreferredVoice();
      if (preferredVoice) utterance.voice = preferredVoice;

      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.rate = 0.94; // Clear and measured pace
      utterance.pitch = 1.05;

      let started = false;

      utterance.onstart = () => {
        started = true;
        setIsPlaying(true);
        setIsPaused(false);
        setAutoplayBlocked(false);
        onAutoplayBlockedChange?.(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onSpeechEnd?.();
      };

      utterance.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'canceled' && !started) {
          // Autoplay blocked by browser
          setAutoplayBlocked(true);
          onAutoplayBlockedChange?.(true);
        }
        setIsPlaying(false);
      };

      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => {
        setIsPaused(false);
        setIsPlaying(true);
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Fallback detection: if onstart hasn't fired after 800ms and not interacted, it might be waiting for user gesture
        setTimeout(() => {
          if (!started && window.speechSynthesis.speaking === false && !userInteracted) {
            setAutoplayBlocked(true);
            onAutoplayBlockedChange?.(true);
          }
        }, 800);
      } catch (err) {
        console.warn('Speech synthesis autoplay caught:', err);
        setAutoplayBlocked(true);
        onAutoplayBlockedChange?.(true);
      }
    },
    [localMuted, getPreferredVoice, userInteracted, onAutoplayBlockedChange]
  );

  // Load voices if voiceschanged fires
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoices = () => {
        if (spokenText && !lastSpokenRef.current) {
          speak(spokenText);
        }
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [spokenText, speak]);

  // Trigger speech whenever spokenText changes
  useEffect(() => {
    if (spokenText && spokenText !== lastSpokenRef.current) {
      speak(spokenText);
    }
  }, [spokenText, speak]);

  // Global listener for ANY user interaction to seamlessly unblock and start speech
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        if (autoplayBlocked && spokenText) {
          setAutoplayBlocked(false);
          onAutoplayBlockedChange?.(false);
          speak(spokenText);
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [autoplayBlocked, spokenText, speak, onAutoplayBlockedChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !localMuted;
    setLocalMuted(nextMuted);
    if (nextMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
    } else if (spokenText) {
      speak(spokenText);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Autoplay blocked banner notice (Graceful Fallback - Step 14) */}
      {autoplayBlocked && !localMuted && (
        <div
          role="status"
          aria-live="polite"
          className="animate-bounce inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-sm cursor-pointer"
          onClick={() => {
            setAutoplayBlocked(false);
            speak(spokenText);
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Voice guidance is ready — tap anywhere to enable it.</span>
        </div>
      )}

      {/* Accessible subtle voice controls */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-stone-200 text-xs">
        <button
          onClick={toggleMute}
          className="hover:text-amber-300 transition-colors flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded px-1"
          aria-label={localMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
          title={localMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {localMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-300" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
          <span className="text-[11px] font-medium">{localMuted ? 'Muted' : 'Voice Active'}</span>
        </button>

        {!localMuted && isPlaying && (
          <button
            onClick={togglePause}
            className="hover:text-amber-300 transition-colors border-l border-white/20 pl-2 focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded"
            aria-label="Pause voice"
            title="Pause voice"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        )}

        {!localMuted && isPaused && (
          <button
            onClick={togglePause}
            className="hover:text-amber-300 transition-colors border-l border-white/20 pl-2 focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded"
            aria-label="Resume voice"
            title="Resume voice"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
};
