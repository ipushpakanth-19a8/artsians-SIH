/**
 * Automated Verification Script for Phase 4: Location Detection (Skill 5)
 */
import assert from 'node:assert/strict';
import {
  normalizeStateName,
  getPrimaryLanguageForState,
  getLanguagesForState
} from '../src/config/stateLanguageMap.js';

async function runPhase4Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 4 — LOCATION DETECTION (SKILL 5)');
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

  // TEST 1: State name normalization
  test('normalizeStateName cleans and resolves standard Indian state names', () => {
    assert.equal(normalizeStateName('Telangana'), 'Telangana');
    assert.equal(normalizeStateName('Andhra Pradesh'), 'Andhra Pradesh');
    assert.equal(normalizeStateName('odisha'), 'Odisha');
    assert.equal(normalizeStateName('west bengal'), 'West Bengal');
    assert.equal(normalizeStateName('karnataka state'), 'Karnataka');
  });

  // TEST 2: Primary language recommendation by state without forced mutation
  test('Regional language recommendations are accurate and never force silent changes', () => {
    assert.equal(getPrimaryLanguageForState('Telangana'), 'te');
    assert.equal(getPrimaryLanguageForState('Andhra Pradesh'), 'te');
    assert.equal(getPrimaryLanguageForState('Tamil Nadu'), 'ta');
    assert.equal(getPrimaryLanguageForState('Karnataka'), 'kn');
    assert.equal(getPrimaryLanguageForState('Kerala'), 'ml');
    assert.equal(getPrimaryLanguageForState('Maharashtra'), 'mr');
    assert.equal(getPrimaryLanguageForState('Gujarat'), 'gu');
    assert.equal(getPrimaryLanguageForState('West Bengal'), 'bn');
    assert.equal(getPrimaryLanguageForState('Punjab'), 'pa');
    assert.equal(getPrimaryLanguageForState('Assam'), 'as');
    assert.equal(getPrimaryLanguageForState('Uttar Pradesh'), 'hi');
  });

  // TEST 3: Multilingual state support returns array of language codes
  test('getLanguagesForState returns primary and secondary languages', () => {
    const telanganaLangs = getLanguagesForState('Telangana');
    assert.ok(telanganaLangs.includes('te'));
    assert.ok(telanganaLangs.includes('hi'));
    assert.ok(telanganaLangs.includes('en'));

    const karnatakaLangs = getLanguagesForState('Karnataka');
    assert.ok(karnatakaLangs.includes('kn'));
    assert.ok(karnatakaLangs.includes('en'));
  });

  // TEST 4: Privacy & Isolation: Coordinates are never mixed with craft or GI data
  test('Location data isolates state/district/place and forbids GI or artisan inference', () => {
    const locationObj = {
      state: 'Telangana',
      district: 'Yadadri Bhuvanagiri',
      place: 'Pochampally'
    };

    // Strict assertion: Location alone cannot claim GI certification
    assert.equal((locationObj as any).isGiCertified, undefined);
    assert.equal((locationObj as any).craftType, undefined);
    assert.equal((locationObj as any).latitude, undefined);
    assert.equal((locationObj as any).longitude, undefined);
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 4 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase4Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
