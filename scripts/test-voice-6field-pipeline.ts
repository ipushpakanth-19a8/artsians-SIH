/**
 * Automated Verification Script for KALAtech 6-Field Voice Assistance Pipeline
 * Tests all requirements from the specification.
 */
import assert from 'node:assert/strict';
import {
  parseConfirmationResponse,
  parseQuantityTranscript,
  parseColorsTranscript,
  cleanVoiceAnswer,
  generateAutoDescription,
} from '../src/lib/voiceParsingService.js';
import { inspectCraftImage } from '../server/services/craftInspection.service.js';
import { PRODUCT_FIELDS } from '../src/components/seller/VoiceProductDetailsPricingWizard.js';

async function runTests() {
  console.log('========================================================================');
  console.log('TESTING: KALATECH 6-FIELD VOICE ASSISTANCE PIPELINE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
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

  async function testAsync(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ TEST ${total} FAILED: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  // TEST 1: Exactly 6 Product Fields
  test('Step contains ONLY the 6 required product fields', () => {
    assert.deepEqual(PRODUCT_FIELDS, [
      'handicraftName',
      'handicraftType',
      'colors',
      'location',
      'quantity',
      'description',
    ]);
    assert.equal(PRODUCT_FIELDS.length, 6);
  });

  // TEST 2: AI Inspection returns structured attributes
  await testAsync('AI Image Detection populates craftName, craftCategory/type, and colors', async () => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfQHz/7l7bAAAAABJRU5ErkJggg==';
    const res = await inspectCraftImage(dummyImage, 'en');
    assert.equal(res.success, true);
    assert.ok(res.canonicalAttributes);
    assert.ok(res.canonicalAttributes.craftName !== undefined);
    assert.ok(res.canonicalAttributes.craftCategory !== undefined);
    assert.ok(Array.isArray(res.canonicalAttributes.colors));
  });

  // TEST 3: Multilingual YES confirmation
  test('Local parser accurately detects YES across regional languages', () => {
    assert.equal(parseConfirmationResponse('yes', 'en'), 'yes');
    assert.equal(parseConfirmationResponse('correct', 'en'), 'yes');
    assert.equal(parseConfirmationResponse('that is right', 'en'), 'yes');
    assert.equal(parseConfirmationResponse('हाँ', 'hi'), 'yes');
    assert.equal(parseConfirmationResponse('सही है', 'hi'), 'yes');
    assert.equal(parseConfirmationResponse('అవును', 'te'), 'yes');
    assert.equal(parseConfirmationResponse('కరెక్ట్', 'te'), 'yes');
    assert.equal(parseConfirmationResponse('ஆம்', 'ta'), 'yes');
    assert.equal(parseConfirmationResponse('ಹೌದು', 'kn'), 'yes');
  });

  // TEST 4: Multilingual NO confirmation
  test('Local parser accurately detects NO across regional languages', () => {
    assert.equal(parseConfirmationResponse('no', 'en'), 'no');
    assert.equal(parseConfirmationResponse('wrong', 'en'), 'no');
    assert.equal(parseConfirmationResponse('incorrect', 'en'), 'no');
    assert.equal(parseConfirmationResponse('नहीं', 'hi'), 'no');
    assert.equal(parseConfirmationResponse('गलत है', 'hi'), 'no');
    assert.equal(parseConfirmationResponse('కాదు', 'te'), 'no');
    assert.equal(parseConfirmationResponse('తప్పు', 'te'), 'no');
    assert.equal(parseConfirmationResponse('இல்லை', 'ta'), 'no');
    assert.equal(parseConfirmationResponse('ಇಲ್ಲ', 'kn'), 'no');
  });

  // TEST 5: Quantity Voice Input Parsing
  test('Quantity voice input extracts positive integers from numbers and words', () => {
    assert.equal(parseQuantityTranscript('Five'), 5);
    assert.equal(parseQuantityTranscript('I have five pieces.'), 5);
    assert.equal(parseQuantityTranscript('5 pieces'), 5);
    assert.equal(parseQuantityTranscript('ten pieces'), 10);
    assert.equal(parseQuantityTranscript('పాతిక'), null); // not a direct single word, but 'ఐదు' is 5
    assert.equal(parseQuantityTranscript('ఐదు పీసులు'), 5);
    assert.equal(parseQuantityTranscript('पाँच'), 5);
    assert.equal(parseQuantityTranscript('0 pieces'), null); // Must be positive (>0)
    assert.equal(parseQuantityTranscript('-2'), null);
  });

  // TEST 6: Colors Voice Parsing
  test('Colors voice parsing splits and normalizes colors into clean array', () => {
    assert.deepEqual(parseColorsTranscript('Red and Black'), ['Red', 'Black']);
    assert.deepEqual(parseColorsTranscript('Blue and White'), ['Blue', 'White']);
    assert.deepEqual(parseColorsTranscript('Terracotta, Indigo, Mustard'), ['Terracotta', 'Indigo', 'Mustard']);
    assert.deepEqual(parseColorsTranscript('Yellow'), ['Yellow']);
  });

  // TEST 7: Conversational Speech Stripping
  test('cleanVoiceAnswer removes conversational filler phrases', () => {
    assert.equal(cleanVoiceAnswer('The name is Kalamkari Saree', 'handicraftName'), 'Kalamkari Saree');
    assert.equal(cleanVoiceAnswer('The type is handloom', 'handicraftType'), 'handloom');
    assert.equal(cleanVoiceAnswer('Change the color to red', 'colors'), 'red');
    assert.equal(cleanVoiceAnswer('The address is Bobbili', 'location'), 'Bobbili');
  });

  // TEST 8: Deterministic Auto Description Generation
  test('generateAutoDescription generates truthful description strictly from confirmed details', () => {
    const descEn = generateAutoDescription(
      {
        handicraftName: 'Pochampally Ikat Saree',
        handicraftType: 'Handloom',
        colors: ['Red', 'Black'],
        location: 'Vizianagaram, Andhra Pradesh, India',
        quantity: 5,
      },
      'en'
    );
    assert.ok(descEn.includes('Pochampally Ikat Saree'));
    assert.ok(descEn.includes('Handloom'));
    assert.ok(descEn.includes('Red and Black'));
    assert.ok(descEn.includes('Vizianagaram, Andhra Pradesh, India'));
    assert.ok(descEn.includes('5 pieces'));
    // Ensure no hallucinated claims
    assert.ok(!descEn.includes('GI certified'));
    assert.ok(!descEn.includes('centuries old'));

    const descTe = generateAutoDescription(
      {
        handicraftName: 'పోచంపల్లి ఇక్కత్ చీర',
        handicraftType: 'చేనేత',
        colors: ['ఎరుపు', 'నలుపు'],
        location: 'విజయనగరం, ఆంధ్రప్రదేశ్',
        quantity: 5,
      },
      'te'
    );
    assert.ok(descTe.includes('పోచంపల్లి ఇక్కత్ చీర'));
    assert.ok(descTe.includes('5 పీసులు'));
  });

  // TEST 9: Description Regeneration on Field Change
  test('Description regenerates automatically when color or quantity changes', () => {
    const initialDesc = generateAutoDescription(
      {
        handicraftName: 'Ikat Saree',
        handicraftType: 'Handloom',
        colors: ['Red'],
        location: 'Andhra Pradesh',
        quantity: 5,
      },
      'en'
    );
    const updatedDesc = generateAutoDescription(
      {
        handicraftName: 'Ikat Saree',
        handicraftType: 'Handloom',
        colors: ['Blue'], // Changed from Red to Blue
        location: 'Andhra Pradesh',
        quantity: 5,
      },
      'en'
    );
    assert.notEqual(initialDesc, updatedDesc);
    assert.ok(updatedDesc.includes('Blue'));
    assert.ok(!updatedDesc.includes('Red'));
  });

  console.log(`\n========================================================================`);
  console.log(`ALL ${passed} / ${total} PIPELINE VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
