import assert from 'assert';
import { PricingService } from '../server/services/pricing.service.js';

async function runFairPricingTests() {
  console.log('--- Testing SKILL 9: Fair Pricing ---');

  // 1. Exact Prompt Test Example:
  // Material: ₹800, Labor Hours: 20, Hourly Wage: ₹150, Margin: 20% (0.20)
  // Expected:
  // Labor Cost: 20 * 150 = ₹3,000
  // Production Cost: ₹800 + ₹3,000 = ₹3,800
  // Fair Price: ₹3,800 / (1 - 0.20) = ₹4,750
  const result = await PricingService.calculateFairPrice({
    materialCost: 800,
    laborHours: 20,
    fairHourlyWage: 150,
    targetMargin: 0.20,
    category: 'Handloom'
  });

  assert.strictEqual(result.laborValue, 3000, 'Labor cost must be ₹3,000 (20 * 150)');
  assert.strictEqual(result.baseCost, 3800, 'Production cost must be ₹3,800 (800 + 3000)');
  assert.strictEqual(result.recommendedFairPrice, 4750, 'Recommended fair price must be ₹4,750 (3800 / 0.8)');
  console.log('✓ Test 1 Passed: Exact prompt example verified:');
  console.log('    Material: ₹800 | Labor: ₹3,000 | Production: ₹3,800 | Recommended Fair Price: ₹4,750');

  // 2. Distinct Separation of Pricing Fields
  assert.ok(result.recommendedFairPrice !== undefined);
  assert.ok(result.marketMinPrice !== undefined);
  assert.ok(result.marketMaxPrice !== undefined);
  assert.ok(result.artisanApprovedPrice !== undefined);
  console.log('✓ Test 2 Passed: Pricing fields cleanly separated:');
  console.log('    Recommended:', result.recommendedFairPrice);
  console.log('    Market Min:', result.marketMinPrice);
  console.log('    Market Max:', result.marketMaxPrice);
  console.log('    Artisan Approved:', result.artisanApprovedPrice);

  // 3. Validation: Reject Negative Inputs
  const negValidation = PricingService.validatePricingInputs({
    materialCost: -100,
    laborHours: -5,
    fairHourlyWage: -50
  });
  assert.strictEqual(negValidation.valid, false, 'Negative values must be rejected');
  assert.ok(negValidation.errors.length >= 3, 'Should produce error for each negative input');
  console.log('✓ Test 3 Passed: Negative values rejected by server-side validation');

  // 4. Test REST Endpoint POST /api/v1/pricing/calculate
  const endpointRes = await fetch('http://localhost:3000/api/v1/pricing/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      materialCost: 800,
      laborHours: 20,
      fairHourlyWage: 150,
      targetMargin: 0.20,
      category: 'Handloom'
    })
  });
  assert.strictEqual(endpointRes.status, 200);
  const epData = await endpointRes.json();
  assert.strictEqual(epData.recommendedFairPrice, 4750);
  console.log('✓ Test 4 Passed: REST endpoint POST /api/v1/pricing/calculate returned ₹4,750');

  console.log('All SKILL 9 Fair Pricing tests passed successfully! ✓\n');
}

runFairPricingTests().catch((err) => {
  console.error('Fair Pricing test failed:', err);
  process.exit(1);
});
