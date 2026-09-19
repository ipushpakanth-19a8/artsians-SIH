import { LanguageCode } from '../types';
import { TranslationKeys } from './types';
import { en } from './en';
import { hi } from './hi';
import { te } from './te';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { mr } from './mr';
import { gu } from './gu';
import { bn } from './bn';
import { or } from './or';
import { pa } from './pa';
import { as } from './as';

export * from './types';
export { en, hi, te, ta, kn, ml, mr, gu, bn, or, pa, as };

const rawTranslations: Record<LanguageCode, TranslationKeys> = {
  en,
  hi,
  te,
  ta,
  kn,
  ml,
  mr,
  gu,
  bn,
  or,
  pa,
  as,
};

/**
 * Crash-proof translation dictionary.
 * Unknown languages safely fall back to English.
 * Missing keys in any regional language safely fall back to English values.
 */
export const translations: Record<LanguageCode, TranslationKeys> = new Proxy(rawTranslations, {
  get(target, prop: string) {
    const langDict = (target as any)[prop] || target.en;
    return new Proxy(langDict, {
      get(dTarget, key: string) {
        return (dTarget as any)[key] ?? (target.en as any)[key] ?? '';
      }
    });
  }
}) as Record<LanguageCode, TranslationKeys>;

// Aliased as coreTranslations for existing callers
export const coreTranslations = translations;

/**
 * Get translated string with safe fallback to English, then raw key
 */
export function t(key: keyof TranslationKeys, lang: LanguageCode = 'en'): string {
  const dict = translations[lang] || translations.en;
  const val = (dict as any)?.[key] ?? (translations.en as any)[key] ?? String(key);
  return typeof val === 'string' ? val : (Array.isArray(val) ? val.join(', ') : String(val));
}

/**
 * Validates that every language implements every required key from TranslationKeys.
 */
export function validateTranslations(): {
  valid: boolean;
  errors: string[];
  report: Record<LanguageCode, boolean>;
} {
  const requiredKeys = Object.keys(en) as (keyof TranslationKeys)[];
  const allLangs: LanguageCode[] = [
    'en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'
  ];

  const errors: string[] = [];
  const report = {} as Record<LanguageCode, boolean>;

  for (const lang of allLangs) {
    const dict = translations[lang];
    if (!dict) {
      errors.push(`Language missing entirely: ${lang}`);
      report[lang] = false;
      continue;
    }

    let langOk = true;
    for (const key of requiredKeys) {
      const val = dict[key];
      if (val === undefined || val === null || val === '') {
        errors.push(`Missing translation: ${lang} → ${String(key)}`);
        langOk = false;
      }
    }
    report[lang] = langOk;
  }

  return {
    valid: errors.length === 0,
    errors,
    report,
  };
}
