import { translations, t, validateTranslations } from './src/i18n';
import { SUPPORTED_LANGUAGE_CONFIGS, getLanguageConfig, getRecognitionLocale, getSpeechLocale } from './src/config/languages';
import { VOICE_PROMPTS, getVoicePrompts } from './src/config/voicePrompts';
import { normalizeSpokenDigits } from './src/lib/useVoiceFormAssistant';
import { LanguageCode } from './src/types';

console.log('============================================================');
console.log('RUNNING COMPREHENSIVE MULTILINGUAL VERIFICATION SUITE');
console.log('============================================================\n');

const EXPECTED_LANGUAGES: LanguageCode[] = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'];

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Language Configs & Locales
console.log('TEST SUITE 1: Language Configs and Locales (12 Languages)');
for (const lang of EXPECTED_LANGUAGES) {
  const cfg = getLanguageConfig(lang);
  assert(!!cfg, `Config exists for language '${lang}'`);
  assert(cfg.id === lang, `Config id matches '${lang}'`);
  assert(!!cfg.nativeName && cfg.nativeName.length > 0, `Native name present for '${lang}': ${cfg.nativeName}`);
  assert(getRecognitionLocale(lang).endsWith('-IN'), `Recognition locale for '${lang}' has valid IN locale: ${getRecognitionLocale(lang)}`);
  assert(getSpeechLocale(lang).endsWith('-IN'), `Speech locale for '${lang}' has valid IN locale: ${getSpeechLocale(lang)}`);
}

// 2. Translation Dictionaries Completeness
console.log('\nTEST SUITE 2: Translation Dictionaries Completeness');
const validationResult = validateTranslations();
assert(validationResult.valid, `Centralized validateTranslations() returned true with 0 errors`);

const sampleKeys = [
  'appName', 'tagline', 'heroHeading', 'fairPrice', 'laborHours', 
  'materialCost', 'welcome', 'continue', 'listening', 'billing'
];

for (const lang of EXPECTED_LANGUAGES) {
  const dict = translations[lang];
  const enKeyCount = Object.keys(translations.en).length;
  assert(Object.keys(dict).length === enKeyCount, `'${lang}' dictionary contains all ${enKeyCount} translation keys (actual: ${Object.keys(dict).length})`);
  for (const k of sampleKeys) {
    const val = (dict as any)[k];
    assert(typeof val === 'string' && val.trim().length > 0, `Key '${k}' in '${lang}' is non-empty string: "${val}"`);
  }
}

// 3. Translation Helper t()
console.log('\nTEST SUITE 3: Translation Helper t() with Fallbacks');
for (const lang of EXPECTED_LANGUAGES) {
  const appName = t('appName', lang);
  assert(typeof appName === 'string' && appName.length > 0, `t('appName', '${lang}') returns: "${appName}"`);
  const fairPrice = t('fairPrice', lang);
  assert(typeof fairPrice === 'string' && fairPrice.length > 0, `t('fairPrice', '${lang}') returns: "${fairPrice}"`);
}

// 4. Voice Prompts System
console.log('\nTEST SUITE 4: Voice Prompts for All 12 Languages');
for (const lang of EXPECTED_LANGUAGES) {
  const prompts = getVoicePrompts(lang);
  assert(!!prompts, `Voice prompts exist for '${lang}'`);
  assert(typeof prompts.welcomeState === 'string' && prompts.welcomeState.length > 0, `'${lang}' welcomeState is valid`);
  assert(typeof prompts.welcomeLanguage('Odisha') === 'string' && prompts.welcomeLanguage('Odisha').length > 0, `'${lang}' welcomeLanguage() executes`);
  assert(typeof prompts.confirmPhone('9876543210') === 'string', `'${lang}' confirmPhone() executes`);
  assert(typeof prompts.confirmSummary('Ramesh', 'Woodcarving') === 'string', `'${lang}' confirmSummary() executes`);
  const fairExplanation = prompts.explainFairPrice('2500', '800', 12, '150');
  assert(typeof fairExplanation === 'string' && fairExplanation.length > 0, `'${lang}' explainFairPrice() executes`);
}

// 5. Spoken Digit Normalization
console.log('\nTEST SUITE 5: Spoken Digit & Number Parsing Across Languages');
assert(normalizeSpokenDigits('nine eight seven six five four three two one zero').replace(/\s+/g, '') === '9876543210', 'English number words normalized');
assert(normalizeSpokenDigits('नौ आठ सात छह पांच चार तीन दो एक शून्य').replace(/\s+/g, '') === '9876543210', 'Hindi number words normalized');
assert(normalizeSpokenDigits('తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా').replace(/\s+/g, '') === '9876543210', 'Telugu number words normalized');
assert(normalizeSpokenDigits('ஒன்பது எட்டு ஏழு ஆறு ஐந்து நான்கு மூன்று இரண்டு ஒன்று பூஜ்ஜியம்').replace(/\s+/g, '') === '9876543210', 'Tamil number words normalized');
assert(normalizeSpokenDigits('ಒಂಬತ್ತು ಎಂಟು ಏಳು ಆರು ಐದು ನಾಲ್ಕು ಮೂರು ಎರಡು ಒಂದು ಸೊನ್ನೆ').replace(/\s+/g, '') === '9876543210', 'Kannada number words normalized');
assert(normalizeSpokenDigits('ഒൻപത് എട്ട് ഏഴ് ആറ് അഞ്ച് നാല് മൂന്ന് രണ്ട് ഒന്ന് പൂജ്യം').replace(/\s+/g, '') === '9876543210', 'Malayalam number words normalized');
assert(normalizeSpokenDigits('नऊ आठ सात सहा पाच चार तीन दोन एक शून्य').replace(/\s+/g, '') === '9876543210', 'Marathi number words normalized');
assert(normalizeSpokenDigits('નવ આઠ સાત છ પાંચ ચાર ત્રણ બે એક શૂન્ય').replace(/\s+/g, '') === '9876543210', 'Gujarati number words normalized');
assert(normalizeSpokenDigits('নয় আট সাত ছয় পাঁচ চার তিন দুই এক শূণ্য').replace(/\s+/g, '') === '9876543210', 'Bengali number words normalized');
assert(normalizeSpokenDigits('ନଅ ଆଠ ସାତ ଛଅ ପାଞ୍ଚ ଚାରି ତିନି ଦୁଇ ଏକ ଶୂନ').replace(/\s+/g, '') === '9876543210', 'Odia number words normalized');
assert(normalizeSpokenDigits('ਨੌਂ ਅੱਠ ਸੱਤ ਛੇ ਪੰਜ ਚਾਰ ਤਿੰਨ ਦੋ ਇੱਕ ਸਿਫ਼ਰ').replace(/\s+/g, '') === '9876543210', 'Punjabi number words normalized');
assert(normalizeSpokenDigits('ন আঠ সাত ছয় পাঁচ চাৰি তিনি দুই এক শূন্য').replace(/\s+/g, '') === '9876543210', 'Assamese number words normalized');

console.log('\n============================================================');
console.log(`ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
console.log('============================================================');
