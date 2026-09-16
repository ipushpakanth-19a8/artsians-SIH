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

export const translations: Record<LanguageCode, TranslationKeys> = {
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

// Aliased as coreTranslations for existing callers
export const coreTranslations = translations;

/**
 * Get translated string with safe fallback to English, then raw key
 */
export function t(key: keyof TranslationKeys, lang: LanguageCode = 'en'): string {
  const dict = translations[lang] || translations.en;
  const val = dict?.[key] ?? translations.en[key] ?? String(key);
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
