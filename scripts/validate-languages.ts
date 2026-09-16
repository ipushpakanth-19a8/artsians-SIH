import { SUPPORTED_LANGUAGE_CONFIGS, getLanguageConfig, getRecognitionLocale, getSpeechLocale } from '../src/config/languages.js';
import { VOICE_PROMPTS, getVoicePrompts } from '../src/config/voicePrompts.js';
import { translations } from '../src/lib/i18n.js';
import { PORTAL_TRANSLATIONS } from '../src/lib/portalI18n.js';

const EXPECTED_LANGUAGES = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'];

console.log('=== MULTILINGUAL INDIAN LANGUAGE VALIDATION ===\n');

let failed = false;

console.log(`Checking 12 Supported Languages: ${EXPECTED_LANGUAGES.join(', ')}`);

for (const lang of EXPECTED_LANGUAGES) {
  const config = getLanguageConfig(lang as any);
  if (!config) {
    console.error(`❌ [FAIL] Missing LanguageConfig for ${lang}`);
    failed = true;
    continue;
  }

  const recLocale = getRecognitionLocale(lang as any);
  const spkLocale = getSpeechLocale(lang as any);

  if (!recLocale || !recLocale.includes('-IN')) {
    console.error(`❌ [FAIL] Invalid Recognition Locale for ${lang}: ${recLocale}`);
    failed = true;
  }

  if (!spkLocale || !spkLocale.includes('-IN')) {
    console.error(`❌ [FAIL] Invalid Speech Locale for ${lang}: ${spkLocale}`);
    failed = true;
  }

  const prompts = getVoicePrompts(lang as any);
  if (!prompts) {
    console.error(`❌ [FAIL] Missing voice prompts for ${lang}`);
    failed = true;
  } else {
    const requiredPromptKeys = [
      'welcomeState', 'welcomeLanguage', 'askPhone', 'confirmPhone',
      'repeatPhone', 'askOtp', 'repeatOtp', 'askName', 'repeatName',
      'askCraft', 'repeatCraft', 'confirmSummary', 'askProductName',
      'askLaborHours', 'askMaterialCost', 'explainFairPrice'
    ];
    for (const key of requiredPromptKeys) {
      if (!(key in prompts)) {
        console.error(`❌ [FAIL] Missing prompt key '${key}' for ${lang}`);
        failed = true;
      }
    }
  }

  // Check UI translations
  const uiTrans = (translations as any)[lang];
  if (!uiTrans) {
    console.error(`❌ [FAIL] Missing UI translations for ${lang}`);
    failed = true;
  }

  // Check portal translations proxy
  const portalTrans = PORTAL_TRANSLATIONS[lang as any];
  if (!portalTrans || !portalTrans.heroHeading) {
    console.error(`❌ [FAIL] Portal translations broken or missing heroHeading for ${lang}`);
    failed = true;
  }

  console.log(`✓ [PASS] Language: ${lang.padEnd(4)} | Native: ${config.nativeName.padEnd(12)} | STT: ${recLocale.padEnd(7)} | TTS: ${spkLocale.padEnd(7)} | Prompts: OK | UI: OK`);
}

if (failed) {
  console.error('\n❌ Language Validation FAILED! Check above errors.');
  process.exit(1);
} else {
  console.log('\n✅ ALL 12 INDIAN LANGUAGES VALIDATED SUCCESSFULLY!');
}
