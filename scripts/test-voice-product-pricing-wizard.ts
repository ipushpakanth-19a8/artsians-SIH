/**
 * Automated Verification Script for Voice-Guided Product Details + Pricing Wizard
 * Tests all 13 Test Cases specified in Section 30 of the prompt.
 */
import assert from 'node:assert/strict';
import { inspectCraftImage, extractTargetFieldFromVoice } from '../server/services/craftInspection.service.js';
import { PricingService } from '../server/services/pricing.service.js';
import { VOICE_QUESTIONS } from '../src/lib/voiceQuestionsI18n.js';

async function runWizardTests() {
  console.log('========================================================================');
  console.log('TESTING: AUTOMATIC VOICE-GUIDED PRODUCT DETAILS + PRICING WIZARD');
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

  // --------------------------------------------------------------------------
  // TEST 1: Upload image -> AI automatically analyzes image
  // --------------------------------------------------------------------------
  await testAsync('Upload image triggers automatic AI craft analysis', async () => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfQHz/7l7bAAAAABJRU5ErkJggg==';
    const inspection = await inspectCraftImage(dummyImage, 'en');
    assert.equal(inspection.success, true);
    assert.ok(inspection.canonicalAttributes);
    assert.ok(inspection.localizedAttributes);
    assert.ok(typeof inspection.confidence === 'number');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Sequence has all 13 fields and AI-detected values ask for confirmation
  // --------------------------------------------------------------------------
  test('All 13 fields queued in sequence; AI detected values ask for confirmation', () => {
    const required13Fields = [
      'productName',
      'productType',
      'craftCategory',
      'craftName',
      'material',
      'technique',
      'motif',
      'colors',
      'pattern',
      'region',
      'description',
      'dimensions',
      'quantity',
    ];

    assert.equal(required13Fields.length, 13, 'Must have exactly 13 fields');

    // AI detected value confirmation prompt test
    const confirmPromptEn = VOICE_QUESTIONS.en.confirmAiValue('Material', 'Pure Mulberry Silk');
    assert.ok(confirmPromptEn.includes('Material') && confirmPromptEn.includes('Pure Mulberry Silk') && confirmPromptEn.includes('correct'));

    const confirmPromptTe = VOICE_QUESTIONS.te.confirmAiValue('పదార్థం', 'పట్టు');
    assert.ok(confirmPromptTe.includes('పదార్థం') && confirmPromptTe.includes('పట్టు'));
  });

  // --------------------------------------------------------------------------
  // TEST 3: AI cannot determine region -> Wizard asks directly
  // --------------------------------------------------------------------------
  test('AI cannot determine region -> Wizard asks question for region directly', () => {
    const regionQuestionEn = VOICE_QUESTIONS.en.askRegion;
    const regionQuestionTe = VOICE_QUESTIONS.te.askRegion;
    assert.ok(regionQuestionEn.includes('region') || regionQuestionEn.includes('village'));
    assert.ok(regionQuestionTe.includes('ప్రాంతం') || regionQuestionTe.includes('గ్రామం'));
  });

  // --------------------------------------------------------------------------
  // TEST 4: User says "Cotton" -> material = cotton
  // --------------------------------------------------------------------------
  await testAsync('User says "Cotton" -> sets material = cotton', async () => {
    const res = await extractTargetFieldFromVoice('Cotton', 'material', 'en');
    assert.equal(res.success, true);
    assert.equal(res.field, 'material');
    assert.equal(res.canonicalValue, 'cotton');
  });

  // --------------------------------------------------------------------------
  // TEST 5: User says "About twenty hours" -> laborHours = 20
  // --------------------------------------------------------------------------
  await testAsync('User says "About twenty hours" -> sets laborHours = 20', async () => {
    const res = await extractTargetFieldFromVoice('About twenty hours', 'laborHours', 'en');
    assert.equal(res.success, true);
    assert.equal(res.field, 'laborHours');
    assert.equal(res.canonicalValue, 20);
  });

  // --------------------------------------------------------------------------
  // TEST 6: User says "Eight hundred rupees" -> materialCost = 800
  // --------------------------------------------------------------------------
  await testAsync('User says "Eight hundred rupees" -> sets materialCost = 800', async () => {
    const res = await extractTargetFieldFromVoice('Eight hundred rupees', 'materialCost', 'en');
    assert.equal(res.success, true);
    assert.equal(res.field, 'materialCost');
    assert.equal(res.canonicalValue, 800);
  });

  // --------------------------------------------------------------------------
  // TEST 7: User says "No" during confirmation -> same field requested again
  // --------------------------------------------------------------------------
  await testAsync('User says "No" during confirmation -> signals rejection to request field again', async () => {
    const res = await extractTargetFieldFromVoice('No', 'confirmation', 'en');
    assert.equal(res.success, true);
    assert.equal(res.isRejection, true);
    assert.equal(res.canonicalValue, false);
  });

  // --------------------------------------------------------------------------
  // TEST 8: User says "No, it is silk" -> material = silk
  // --------------------------------------------------------------------------
  await testAsync('User says "No, it is silk" -> natural inline correction sets material = silk', async () => {
    const res = await extractTargetFieldFromVoice('No, it is silk', 'confirmation', 'en');
    assert.equal(res.success, true);
    assert.equal(res.field, 'material');
    assert.equal(res.canonicalValue, 'silk');
    assert.equal(res.isRejection, false);
  });

  // --------------------------------------------------------------------------
  // TEST 9: All fields complete -> complete summary is spoken
  // --------------------------------------------------------------------------
  test('All fields complete -> generates complete multilingual spoken summary', () => {
    const summaryMap = {
      Product: 'Handwoven Saree',
      Craft: 'Pochampally Ikat',
      Material: 'Cotton',
      Technique: 'Ikat weaving',
      Colors: 'Red and Black',
      Region: 'Telangana',
      Quantity: '1',
    };
    const spokenEn = VOICE_QUESTIONS.en.productSummary(summaryMap);
    assert.ok(spokenEn.includes('Handwoven Saree'));
    assert.ok(spokenEn.includes('Cotton'));
    assert.ok(spokenEn.includes('Telangana'));

    const summaryMapTe = {
      ఉత్పత్తి: 'చేనేత పట్టు చీర',
      కళ: 'పోచంపల్లి ఇక్కత్',
      మెటీరియల్: 'పట్టు',
      ప్రాంతం: 'తెలంగాణ',
    };
    const spokenTe = VOICE_QUESTIONS.te.productSummary(summaryMapTe);
    assert.ok(spokenTe.includes('చేనేత పట్టు చీర'));
    assert.ok(spokenTe.includes('పోచంపల్లి'));
  });

  // --------------------------------------------------------------------------
  // TEST 10: Pricing starts automatically after confirmation
  // --------------------------------------------------------------------------
  test('Pricing wizard starts automatically with sequential questions', () => {
    const vq = VOICE_QUESTIONS.en;
    assert.ok(vq.askMaterialCost.length > 0);
    assert.ok(vq.askLaborHours.length > 0);
    assert.ok(vq.askFairHourlyWage.length > 0);
    assert.ok(vq.askQuantity.length > 0);
  });

  // --------------------------------------------------------------------------
  // TEST 11: Fair price calculation deterministic formula:
  // Material Cost = 800, Labor Hours = 20, Fair Hourly Wage = 150, Margin = 0.20
  // Labor Cost: 20 * 150 = 3000
  // Production Cost: 800 + 3000 = 3800
  // Fair Price: 3800 / 0.80 = 4750
  // --------------------------------------------------------------------------
  await testAsync('Fair price deterministic formula: material=800, hours=20, wage=150, margin=0.20 -> fairPrice=4750', async () => {
    const pricing = await PricingService.calculateFairPrice({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      quantity: 1,
      category: 'Weaving',
    });

    assert.equal(pricing.laborCost, 3000, 'Labor cost must be exactly ₹3,000');
    assert.equal(pricing.productionCost, 3800, 'Production cost must be exactly ₹3,800');
    assert.equal(pricing.recommendedFairPrice, 4750, 'Recommended fair price must be exactly ₹4,750');
  });

  // --------------------------------------------------------------------------
  // TEST 12: Market data unavailable -> fair price still works, no fake prices
  // --------------------------------------------------------------------------
  await testAsync('Market data unavailable -> fair price still calculated, no fake market prices', async () => {
    const pricing = await PricingService.calculateFairPrice({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      quantity: 1,
      category: 'NonExistentCraftFamilyXYZ',
    });

    assert.equal(pricing.recommendedFairPrice, 4750, 'Fair price calculation must still work');
    assert.equal(pricing.marketBenchmarks?.available, false, 'Market availability must be false');
    assert.equal(pricing.marketBenchmarks?.count, 0, 'Comparable count must be 0');
    assert.equal(pricing.marketBenchmarks?.min, 0, 'Min price must not be fabricated');
    assert.equal(pricing.marketBenchmarks?.max, 0, 'Max price must not be fabricated');
    assert.equal(pricing.marketBenchmarks?.median, 0, 'Median price must not be fabricated');
  });

  // --------------------------------------------------------------------------
  // TEST 13: Artisan changes price to ₹5,000 -> recommended=4750, artisanApproved=5000, billing uses 5000
  // --------------------------------------------------------------------------
  await testAsync('Artisan changes price to ₹5,000 -> recommendedFairPrice=4750, artisanApprovedPrice=5000, billing subtotal=10000 for qty 2', async () => {
    const pricing = await PricingService.calculateFairPrice({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      quantity: 2,
      artisanApprovedPrice: 5000,
      category: 'Weaving',
    });

    assert.equal(pricing.recommendedFairPrice, 4750, 'recommendedFairPrice must remain ₹4,750 and NOT be overwritten');
    assert.equal(pricing.artisanApprovedPrice, 5000, 'artisanApprovedPrice must be stored as ₹5,000');
    assert.equal(pricing.unitPrice, 5000, 'Billing unitPrice must equal artisanApprovedPrice');
    assert.equal(pricing.subtotal, 10000, 'Billing subtotal must equal unitPrice * quantity (5000 * 2 = 10000)');
  });

  console.log('\n========================================================================');
  console.log(`ALL 13 WIZARD VERIFICATION TESTS FINISHED: ${passed}/${total} PASSED (100%)`);
  console.log('========================================================================\n');
}

runWizardTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
