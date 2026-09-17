/**
 * lib/i18n.ts — Thin adapter over centralized src/i18n/ translations.
 * 
 * All translation data lives in src/i18n/*.ts (12 languages).
 * This file re-exports everything for backward compatibility with
 * the 30+ components that import from '../lib/i18n'.
 */
import { LanguageCode } from '../types';
import { translations as centralizedTranslations, TranslationKeys } from '../i18n';

// Re-export the canonical type under its legacy name
export type UIStrings = TranslationKeys;

/**
 * translations — Proxy-backed record that falls back to English
 * for any LanguageCode not present in the centralized data.
 */
export const translations: Record<LanguageCode, UIStrings> = new Proxy(centralizedTranslations as any, {
  get: (target, prop: string) => {
    return target[prop] || target.en;
  }
});

// ---------------------------------------------------------------------------
// Speech synthesis utilities (consumed by 20+ components)
// ---------------------------------------------------------------------------

const REGIONAL_VOICE_TAGS: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  as: 'as-IN',
};

export function speakText(
  text: string,
  lang: LanguageCode = 'en',
  onEnd?: () => void,
  onStart?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 100);
    return;
  }
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = REGIONAL_VOICE_TAGS[lang] || 'en-IN';
    utterance.lang = targetLocale;

    let selectedVoiceName = 'default';
    if ('getVoices' in window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang.toLowerCase().replace('_', '-').startsWith(lang)
      );
      if (match) {
        utterance.voice = match;
        selectedVoiceName = match.name;
      }
    }

    if ((import.meta as any).env?.DEV) {
      console.log(`[VOICE] TTS starting`);
      console.log(`[VOICE] voiceSelected = ${selectedVoiceName}`);
    }

    utterance.rate = 0.93;

    let hasEnded = false;
    let fallbackTimer: any = null;

    const triggerEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);
        if ((import.meta as any).env?.DEV) {
          console.log(`[VOICE] TTS ended`);
        }
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = triggerEnd;
    utterance.onerror = (err) => {
      if ((import.meta as any).env?.DEV) {
        console.warn(`[VOICE] TTS error:`, err);
      }
      triggerEnd();
    };

    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Safety timeout in case browser TTS event doesn't fire (speechSynthesis bug in some browsers)
    const approxDurationMs = Math.max(2000, Math.min(20000, text.length * 90));
    fallbackTimer = setTimeout(triggerEnd, approxDurationMs + 1000);
  } catch (e) {
    console.error('Speech synthesis error:', e);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
