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

export function speakText(text: string, lang: LanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = REGIONAL_VOICE_TAGS[lang] || 'en-IN';
    utterance.lang = targetLocale;

    if ('getVoices' in window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang.toLowerCase().replace('_', '-').startsWith(lang)
      );
      if (match) utterance.voice = match;
    }

    utterance.rate = 0.93;
    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
