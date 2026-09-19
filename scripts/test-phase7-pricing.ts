/**
 * Automated Verification Script for Phase 7: Fair Living-Wage Pricing (Skill 9)
 */
import assert from 'node:assert/strict';
import { PricingService } from '../server/services/pricing.service.js';

async function runPhase7Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 7 — FAIR LIVING-WAGE PRICING (SKILL 9)');
  console.log('========================================================================\n');

  let total = 0;
  let passed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
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

  // TEST 1: Canonical Fair Pricing Formula matches specification example exactly
  await test('Fair price formula matches specification example exactly: ₹4,750', async () => {
    // material = ₹800, laborHours = 20, hourlyWage = ₹150, margin = 20% (0.20)
    // labor = 20 * 150 = ₹3,000
    // production = 800 + 3000 = ₹3,800
    // fair price = 3800 / (1 - 0.20) = ₹4,750
    const res = await PricingService.calculateFairPrice({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      category: 'Handloom',
      quantity: 1,
    });

    assert.equal(res.calculation.laborCost, 3000);
    assert.equal(res.calculation.productionCost, 3800);
    assert.equal(res.recommendedFairPrice, 4750);
  });

  // TEST 2: Strict separation of price tiers
  await test('Recommended fair price, market range, and artisan-approved price are kept separate', async () => {
    const res = await PricingService.calculateFairPrice({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      category: 'Handloom',
      artisanApprovedPrice: 4800, // Artisan chose to round up to ₹4,800
    });

    assert.equal(res.recommendedFairPrice, 4750);
    assert.equal(res.artisanApprovedPrice, 4800);
    assert.ok(res.marketBenchmark.priceLow <= res.marketBenchmark.priceHigh);
    assert.ok(res.marketBenchmark.averagePrice > 0);
    // Verified: Final selling price is artisanApprovedPrice
    assert.equal(res.finalPrice, 4800);
  });

  // TEST 3: Validation rejects negative costs and invalid inputs
  await test('Validation rejects negative costs, wages, and invalid margins', () => {
    const check1 = PricingService.validatePricingInputs({ materialCost: -100 });
    assert.equal(check1.valid, false);

    const check2 = PricingService.validatePricingInputs({ laborHours: -5 });
    assert.equal(check2.valid, false);

    const check3 = PricingService.validatePricingInputs({ targetMargin: 1.5 }); // >= 1
    assert.equal(check3.valid, false);
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 7 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase7Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
