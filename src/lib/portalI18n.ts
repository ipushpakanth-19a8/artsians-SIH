import { LanguageCode } from '../types';
import { TranslationKeys } from '../i18n/types';
import { translations as centralizedTranslations } from '../i18n';

// Re-export TranslationKeys as PortalStrings for backward compatibility
export type PortalStrings = TranslationKeys;

export interface CraftCategoryOption {
  id: string;
  name: string;
  nativeHi: string;
  nativeTe: string;
  iconName: string;
  example: string;
}

export const CRAFT_CATEGORIES: CraftCategoryOption[] = [
  { id: 'Weaving', name: 'Handloom & Weaving', nativeHi: 'हथकरघा बुनाई', nativeTe: 'చేనేత మగ్గం', iconName: 'Scissors', example: 'Pochampally, Banarasi, Khadi' },
  { id: 'Pottery', name: 'Terracotta & Pottery', nativeHi: 'मिट्टी के बर्तन / टेराकोटा', nativeTe: 'మట్టి పాత్రలు / టెర్రకోట', iconName: 'Flame', example: 'Khurja, Gorakhpur, Blue Pottery' },
  { id: 'Woodwork', name: 'Woodcraft & Carving', nativeHi: 'काष्ठ शिल्प एवं खिलौने', nativeTe: 'చెక్క శిల్పాలు & బొమ్మలు', iconName: 'Trees', example: 'Channapatna, Saharanpur, Kondapalli' },
  { id: 'Metalcraft', name: 'Metalcraft & Dhokra', nativeHi: 'धातु शिल्प एवं ढोकरा', nativeTe: 'లోహ శిల్పకళ & డోక్రా', iconName: 'Sparkles', example: 'Bastar Dhokra, Moradabad Brass, Bidriware' },
  { id: 'Embroidery', name: 'Embroidery & Textile', nativeHi: 'कढ़ाई एवं जरदोजी', nativeTe: 'ఎంబ్రాయిడరీ & వస్త్ర కళ', iconName: 'Feather', example: 'Chikan, Phulkari, Kantha, Kasuti' },
  { id: 'Painting', name: 'Folk & Tribal Painting', nativeHi: 'लोक चित्रकला', nativeTe: 'జానపద చిత్రలేఖనం', iconName: 'Palette', example: 'Madhubani, Warli, Pattachitra, Kalamkari' },
];

/**
 * PORTAL_TRANSLATIONS — thin adapter over centralized src/i18n/ translations.
 * Uses a Proxy to safely fall back to English for any missing language.
 */
export const PORTAL_TRANSLATIONS: Record<LanguageCode, PortalStrings> = new Proxy(centralizedTranslations as any, {
  get: (target, prop: string) => {
    return target[prop] || target.en;
  }
});
