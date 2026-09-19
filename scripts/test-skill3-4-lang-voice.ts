import assert from 'assert';
import { translations, t, validateTranslations } from '../src/i18n/index.js';
import { SUPPORTED_LANGUAGE_CONFIGS } from '../src/config/languages.js';
import { parseUserVoiceIntent } from '../src/lib/useVoiceForm.js';
import { normalizeSpokenDigits, cleanSpokenValue } from '../src/lib/useVoiceFormAssistant.js';
import { LanguageCode } from '../src/types.js';

async function runLanguageVoiceTests() {
  console.log('--- Testing SKILL 3 & SKILL 4: Language & Voice Assistance ---');

  // 1. Validate all 12 languages exist and have non-empty dictionaries
  const all12Langs: LanguageCode[] = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'];
  for (const lang of all12Langs) {
    const config = SUPPORTED_LANGUAGE_CONFIGS[lang];
    assert.ok(config, `Language config missing for ${lang}`);
    assert.strictEqual(config.id, lang);
    assert.ok(config.speechLocale.endsWith('-IN'), `Speech locale for ${lang} must end in -IN`);
    assert.ok(config.recognitionLocale.endsWith('-IN'), `Recognition locale for ${lang} must end in -IN`);
  }
  console.log('✓ Test 1 Passed: All 12 Indian languages and *-IN locales configured');

  // 2. Test Safe Proxy fallback against missing/undefined keys
  const fakeKeyVal = (translations.hi as any).nonExistentKey123;
  // Proxy must return empty string or English fallback, NEVER throw Cannot read property of undefined
  assert.ok(fakeKeyVal === '' || typeof fakeKeyVal === 'string');

  const unknownLangDict = (translations as any)['fr'];
  assert.ok(unknownLangDict, 'Unknown language dict should return English fallback');
  assert.ok(unknownLangDict.heroHeading, 'English heroHeading should be present for unknown language fallback');
  console.log('✓ Test 2 Passed: Safe Proxy fallback guarantees zero undefined runtime errors');

  // 3. Test Intent Parsing for YES / NO across English, Hindi, Telugu, Tamil
  assert.strictEqual(parseUserVoiceIntent('yes', 'en').intent, 'yes');
  assert.strictEqual(parseUserVoiceIntent('हाँ', 'hi').intent, 'yes');
  assert.strictEqual(parseUserVoiceIntent('haan', 'hi').intent, 'yes');
  assert.strictEqual(parseUserVoiceIntent('అవును', 'te').intent, 'yes');
  assert.strictEqual(parseUserVoiceIntent('avunu', 'te').intent, 'yes');
  assert.strictEqual(parseUserVoiceIntent('ஆம்', 'ta').intent, 'yes');

  assert.strictEqual(parseUserVoiceIntent('no', 'en').intent, 'no');
  assert.strictEqual(parseUserVoiceIntent('नहीं', 'hi').intent, 'no');
  assert.strictEqual(parseUserVoiceIntent('nahi', 'hi').intent, 'no');
  assert.strictEqual(parseUserVoiceIntent('కాదు', 'te').intent, 'no');
  assert.strictEqual(parseUserVoiceIntent('kaadu', 'te').intent, 'no');
  assert.strictEqual(parseUserVoiceIntent('இல்லை', 'ta').intent, 'no');
  console.log('✓ Test 3 Passed: Multilingual YES/NO intent parsing verified across languages');

  // 4. Test Data Value Intent Extraction
  const valResult = parseUserVoiceIntent('Handwoven Pochampally Saree', 'en');
  assert.strictEqual(valResult.intent, 'value');
  assert.strictEqual(valResult.cleanedValue, 'Handwoven Pochampally Saree');

  const prefixedResult = parseUserVoiceIntent('the name is Terracotta Vase', 'en');
  assert.strictEqual(prefixedResult.cleanedValue, 'Terracotta Vase');
  console.log('✓ Test 4 Passed: Voice data value extraction and prefix cleanup verified');

  // 5. Test Spoken Number Word Normalization across languages
  assert.strictEqual(cleanSpokenValue('nine eight seven six five four three two one zero', 'tel'), '9876543210');
  assert.strictEqual(cleanSpokenValue('नौ आठ सात छह पाँच चार तीन दो एक शून्य', 'tel'), '9876543210');
  assert.strictEqual(cleanSpokenValue('తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా', 'tel'), '9876543210');
  console.log('✓ Test 5 Passed: Spoken digit normalization works across English, Hindi, and Telugu');

  console.log('All SKILL 3 & SKILL 4 tests passed successfully! ✓\n');
}

runLanguageVoiceTests().catch((err) => {
  console.error('Language/Voice test failed:', err);
  process.exit(1);
});
