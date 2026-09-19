/**
 * Automated Verification Script for Phase 3: Language, Localization & Voice Engine
 */
import assert from 'node:assert/strict';
import { translations, t } from '../src/i18n/index.js';
import { SUPPORTED_LANGUAGE_CONFIGS } from '../src/config/languages.js';
import { parseUserVoiceIntent } from '../src/lib/useVoiceForm.js';

async function runPhase3Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 3 — LANGUAGE, LOCALIZATION & VOICE ENGINE (SKILLS 3 & 4)');
  console.log('========================================================================\n');

  let total = 0;
  let passed = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ TEST ${total} FAILED: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  // TEST 1: Crash-Proof Translation Proxy
  test('Translations proxy gracefully falls back to English and never throws undefined', () => {
    // 1. Unknown language falls back to English
    const unknownLang = (translations as any)['unknown_language'];
    assert.ok(unknownLang);
    assert.ok(typeof unknownLang.heroHeading === 'string');

    // 2. Missing key in an existing regional language falls back to English
    const missingKey = (translations.te as any)['non_existent_key_xyz'];
    assert.equal(missingKey, '');

    // 3. Helper function t() returns English fallback
    const str = t('heroHeading', 'unknown_lang' as any);
    assert.ok(str && str.length > 0);
  });

  // TEST 2: Distinct Language ID vs Speech Locale
  test('Language ID and speechLocale are strictly decoupled across all 12 languages', () => {
    const expected = [
      { id: 'en', locale: 'en-IN' },
      { id: 'hi', locale: 'hi-IN' },
      { id: 'te', locale: 'te-IN' },
      { id: 'ta', locale: 'ta-IN' },
      { id: 'kn', locale: 'kn-IN' },
      { id: 'ml', locale: 'ml-IN' },
      { id: 'mr', locale: 'mr-IN' },
      { id: 'gu', locale: 'gu-IN' },
      { id: 'bn', locale: 'bn-IN' },
      { id: 'or', locale: 'or-IN' },
      { id: 'pa', locale: 'pa-IN' },
      { id: 'as', locale: 'as-IN' },
    ];

    for (const item of expected) {
      const config = SUPPORTED_LANGUAGE_CONFIGS[item.id as any];
      assert.ok(config, `Config for ${item.id} must exist`);
      assert.equal(config.id, item.id);
      assert.equal(config.speechLocale, item.locale);
      assert.equal(config.recognitionLocale, item.locale);
      assert.notEqual(config.id, config.speechLocale, 'Language ID must not equal speech locale');
    }
  });

  // TEST 3: Multilingual Voice YES Intent Detection
  test('Voice parser recognizes affirmative YES across regional languages', () => {
    assert.equal(parseUserVoiceIntent('yes', 'en').intent, 'yes');
    assert.equal(parseUserVoiceIntent('correct', 'en').intent, 'yes');
    assert.equal(parseUserVoiceIntent('हाँ', 'hi').intent, 'yes');
    assert.equal(parseUserVoiceIntent('सही है', 'hi').intent, 'yes');
    assert.equal(parseUserVoiceIntent('అవును', 'te').intent, 'yes');
    assert.equal(parseUserVoiceIntent('సరి', 'te').intent, 'yes');
    assert.equal(parseUserVoiceIntent('ஆம்', 'ta').intent, 'yes');
    assert.equal(parseUserVoiceIntent('ಹೌದು', 'kn').intent, 'yes');
    assert.equal(parseUserVoiceIntent('হাঁ', 'bn').intent, 'yes');
    assert.equal(parseUserVoiceIntent('हो', 'mr').intent, 'yes');
  });

  // TEST 4: Multilingual Voice NO Intent Detection
  test('Voice parser recognizes negative NO across regional languages', () => {
    assert.equal(parseUserVoiceIntent('no', 'en').intent, 'no');
    assert.equal(parseUserVoiceIntent('wrong', 'en').intent, 'no');
    assert.equal(parseUserVoiceIntent('नहीं', 'hi').intent, 'no');
    assert.equal(parseUserVoiceIntent('गलत', 'hi').intent, 'no');
    assert.equal(parseUserVoiceIntent('కాదు', 'te').intent, 'no');
    assert.equal(parseUserVoiceIntent('తప్పు', 'te').intent, 'no');
    assert.equal(parseUserVoiceIntent('இல்லை', 'ta').intent, 'no');
    assert.equal(parseUserVoiceIntent('ಇಲ್ಲ', 'kn').intent, 'no');
    assert.equal(parseUserVoiceIntent('ना', 'mr').intent, 'no');
  });

  // TEST 5: Control Words (Repeat & Go Back)
  test('Voice parser recognizes repeat and go back controls', () => {
    assert.equal(parseUserVoiceIntent('repeat', 'en').intent, 'repeat');
    assert.equal(parseUserVoiceIntent('फिर से बोलो', 'hi').intent, 'repeat');
    assert.equal(parseUserVoiceIntent('మళ్ళీ చెప్పు', 'te').intent, 'repeat');
    assert.equal(parseUserVoiceIntent('go back', 'en').intent, 'go_back');
    assert.equal(parseUserVoiceIntent('पीछे जाओ', 'hi').intent, 'go_back');
    assert.equal(parseUserVoiceIntent('వెనక్కి వెళ్ళు', 'te').intent, 'go_back');
  });

  // TEST 6: Data Value Extraction & Conversational Prefix Stripping
  test('Voice parser strips conversational filler and captures cleaned product values', () => {
    const res1 = parseUserVoiceIntent('The name is Pochampally Saree', 'en');
    assert.equal(res1.intent, 'value');
    assert.equal(res1.cleanedValue, 'Pochampally Saree');

    const res2 = parseUserVoiceIntent('material is Pure Mulberry Silk', 'en');
    assert.equal(res2.intent, 'value');
    assert.equal(res2.cleanedValue, 'Pure Mulberry Silk');

    const res3 = parseUserVoiceIntent('Terracotta clay pot', 'en');
    assert.equal(res3.intent, 'value');
    assert.equal(res3.cleanedValue, 'Terracotta clay pot');
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 3 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase3Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
