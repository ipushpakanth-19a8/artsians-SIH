import { LanguageCode } from '../types';

export interface LanguageConfig {
  id: LanguageCode;
  nativeName: string;
  englishName: string;
  recognitionLocale: string;
  speechLocale: string;
  translationFile: string;
  flag: string;
  hasUI: boolean;
  hasSTT: boolean;
  hasTTS: boolean;
  spokenKeywords: string[];
}

export const SUPPORTED_LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  en: {
    id: 'en',
    nativeName: 'English',
    englishName: 'English',
    recognitionLocale: 'en-IN',
    speechLocale: 'en-IN',
    translationFile: 'en',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['english', 'angrezi', 'inglish', 'one', 'first']
  },
  hi: {
    id: 'hi',
    nativeName: 'हिंदी',
    englishName: 'Hindi',
    recognitionLocale: 'hi-IN',
    speechLocale: 'hi-IN',
    translationFile: 'hi',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['hindi', 'hindee', 'हिंदी', 'हिन्दी', 'two', 'do']
  },
  te: {
    id: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    recognitionLocale: 'te-IN',
    speechLocale: 'te-IN',
    translationFile: 'te',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['telugu', 'telgu', 'తెలుగు', 'moodu', 'three']
  },
  ta: {
    id: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    recognitionLocale: 'ta-IN',
    speechLocale: 'ta-IN',
    translationFile: 'ta',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['tamil', 'thamizh', 'தமிழ்']
  },
  kn: {
    id: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    recognitionLocale: 'kn-IN',
    speechLocale: 'kn-IN',
    translationFile: 'kn',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['kannada', 'kanada', 'ಕನ್ನಡ']
  },
  ml: {
    id: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    recognitionLocale: 'ml-IN',
    speechLocale: 'ml-IN',
    translationFile: 'ml',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['malayalam', 'മലയാളം']
  },
  mr: {
    id: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    recognitionLocale: 'mr-IN',
    speechLocale: 'mr-IN',
    translationFile: 'mr',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['marathi', 'मराठी']
  },
  gu: {
    id: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    recognitionLocale: 'gu-IN',
    speechLocale: 'gu-IN',
    translationFile: 'gu',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['gujarati', 'gujrati', 'ગુજરાતી']
  },
  bn: {
    id: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    recognitionLocale: 'bn-IN',
    speechLocale: 'bn-IN',
    translationFile: 'bn',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['bengali', 'bangla', 'বাংলা']
  },
  or: {
    id: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    recognitionLocale: 'or-IN',
    speechLocale: 'or-IN',
    translationFile: 'or',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['odia', 'oriya', 'ଓଡ଼ିଆ']
  },
  pa: {
    id: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    recognitionLocale: 'pa-IN',
    speechLocale: 'pa-IN',
    translationFile: 'pa',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['punjabi', 'panjabi', 'ਪੰਜਾਬੀ']
  },
  as: {
    id: 'as',
    nativeName: 'অসমীয়া',
    englishName: 'Assamese',
    recognitionLocale: 'as-IN',
    speechLocale: 'as-IN',
    translationFile: 'as',
    flag: '🇮🇳',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['assamese', 'axomiya', 'অসমীয়া']
  }
};

export function getLanguageConfig(lang: LanguageCode | string): LanguageConfig {
  const config = SUPPORTED_LANGUAGE_CONFIGS[lang as LanguageCode];
  if (config) return config;
  return SUPPORTED_LANGUAGE_CONFIGS.en;
}

export function getRecognitionLocale(lang: LanguageCode | string): string {
  return getLanguageConfig(lang).recognitionLocale;
}

export function getSpeechLocale(lang: LanguageCode | string): string {
  return getLanguageConfig(lang).speechLocale;
}
