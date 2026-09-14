// scripts/test-fair-pricing.mjs
// Automated verification suite for KALAtech Fair Pricing + Voice Explanation Flow

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Starting KALAtech Fair Pricing Automated Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Scenario ${total}: ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Scenario ${total}: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // Scenario 1: Standard Deterministic Fair Price Calculation
    // -------------------------------------------------------------
    console.log('--- Test 1: Standard Deterministic Fair Price Calculation ---');
    const res1 = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Handwoven Silk Stole',
        craftType: 'Handloom',
        material: 'Mulberry Silk',
        materialCost: 800,
        laborHours: 15,
        fairHourlyWage: 100,
        otherCost: 0,
        quantity: 1,
        language: 'en'
      })
    });
    const data1 = await res1.json();
    assert(
      res1.ok &&
      data1.breakdown.laborValue === 1500 &&
      data1.breakdown.baseCost === 2300 &&
      data1.breakdown.marginAmount === 575 &&
      data1.breakdown.recommendedFairPrice === 2875 &&
      data1.recommendedFairPrice === 2875,
      `Standard formula: 800 + (15*100) = 2300; 2300*0.25 = 575; total = 2875 (received ${data1.recommendedFairPrice})`
    );

    // -------------------------------------------------------------
    // Scenario 2: Zero or Low Material Cost (e.g. foraged clay)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Low / Zero Material Cost ---');
    const res2 = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Foraged Clay Urn',
        craftType: 'Pottery',
        materialCost: 0,
        laborHours: 8,
        fairHourlyWage: 120,
        quantity: 1
      })
    });
    const data2 = await res2.json();
    // labor = 8 * 120 = 960; base = 960; margin = 240; total = 1200
    assert(
      res2.ok &&
      data2.breakdown.materialCost === 0 &&
      data2.breakdown.laborValue === 960 &&
      data2.breakdown.baseCost === 960 &&
      data2.breakdown.marginAmount === 240 &&
      data2.recommendedFairPrice === 1200,
      `Zero material cost calculates correctly: Labor ₹960 + Margin ₹240 = ₹${data2.recommendedFairPrice}`
    );

    // -------------------------------------------------------------
    // Scenario 3: Missing / Fallback Labor Wage & Hours Floor
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Fallback Living Wage Floor ---');
    const res3 = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Simple Bamboo Basket',
        craftType: 'Bamboo/Cane',
        materialCost: 150,
        // No laborHours or fairHourlyWage provided
      })
    });
    const data3 = await res3.json();
    assert(
      res3.ok &&
      data3.breakdown.fairHourlyWage >= 100 &&
      data3.breakdown.laborHours >= 1 &&
      data3.recommendedFairPrice > 150,
      `Default living wage floor (₹${data3.breakdown.fairHourlyWage}/hr) applied when unspecified`
    );

    // -------------------------------------------------------------
    // Scenario 4: Validation Rejection on Negative Inputs
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Validation Rejection on Negative Inputs ---');
    const res4 = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Defective Product',
        materialCost: -50,
        laborHours: -5
      })
    });
    const data4 = await res4.json();
    assert(
      res4.status === 400 && data4.errors && data4.errors.length > 0,
      `Negative numbers rejected with HTTP 400: "${data4.errors?.[0]}"`
    );

    // -------------------------------------------------------------
    // Scenario 5: Quantity > 1 (Per-unit vs Total calculations)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Multi-unit Quantity Scaling ---');
    const res5 = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Festive Clay Diya Pack',
        craftType: 'Pottery',
        materialCost: 50,
        laborHours: 2,
        fairHourlyWage: 100,
        quantity: 4
      })
    });
    const data5 = await res5.json();
    // Unit base = 50 + (2*100) = 250; margin = 63; unit recommended = 313
    // Total for 4 = 1252
    assert(
      res5.ok &&
      data5.breakdown.quantity === 4 &&
      data5.breakdown.totalRecommendedFairPrice === data5.recommendedFairPrice * 4,
      `Quantity scaling: Unit ₹${data5.recommendedFairPrice} × 4 = Total ₹${data5.breakdown.totalRecommendedFairPrice}`
    );

    // -------------------------------------------------------------
    // Scenario 6: Dual-Price Model (Recommended Fair vs Artisan Approved)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Dual-Price Preservation on Product ---');
    // First create a test product
    const createProdRes = await fetch(`${BASE_URL}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Dual Price Test Ikat Shawl',
        category: 'Handloom',
        material: 'Pure Handloom Silk',
        cost: {
          material_cost: 800,
          labor_hours: 15,
          hourly_rate: 100,
          other_cost: 0
        },
        final_price: 2875
      })
    });
    const createdProdData = await createProdRes.json();
    const testProdId = createdProdData.product?.id || createdProdData.id;

    // Artisan adjusts price to 3000
    const patchRes = await fetch(`${BASE_URL}/api/v1/products/${testProdId}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        final_price: 3000,
        materialCost: 800,
        laborHours: 15,
        fairHourlyWage: 100,
        laborValue: 1500,
        baseCost: 2300,
        marginAmount: 575,
        recommendedFairPrice: 2875,
        artisanApprovedPrice: 3000
      })
    });
    const patchData = await patchRes.json();
    assert(
      patchRes.ok &&
      patchData.product.recommendedFairPrice === 2875 &&
      patchData.product.artisanApprovedPrice === 3000 &&
      patchData.product.final_price === 3000,
      `Dual price preserved: Recommended ₹${patchData.product?.recommendedFairPrice} vs Approved ₹${patchData.product?.artisanApprovedPrice}`
    );

    // -------------------------------------------------------------
    // Scenario 7: Anti-Tampering Server-side Price Verification
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Anti-Tampering Price Verification ---');
    const tamperRes = await fetch(`${BASE_URL}/api/v1/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: testProdId,
        quantity: 1,
        buyer_name: 'Adversary Buyer',
        buyer_contact: '+91 99999 88888',
        forged_price: 10 // Client attempts to buy for ₹10!
      })
    });
    const tamperData = await tamperRes.json();
    assert(
      tamperRes.ok &&
      tamperData.total_amount === 3000 &&
      tamperData.unit_price === 3000,
      `Tampered price ₹10 ignored; Server verified and enforced official price ₹${tamperData.total_amount}`
    );

    // -------------------------------------------------------------
    // Scenario 8: Multilingual Voice Explanations (EN, HI, TE)
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Multilingual Voice Explanation Strings ---');
    const multiRes = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Heritage Weave',
        materialCost: 1000,
        laborHours: 10,
        fairHourlyWage: 100
      })
    });
    const multiData = await multiRes.json();
    const hasEn = Boolean(multiData.explanation?.en?.speechText);
    const hasHi = Boolean(multiData.explanation?.hi?.speechText);
    const hasTe = Boolean(multiData.explanation?.te?.speechText);
    const hasCommands = multiData.explanation?.en?.voiceCommands?.length >= 3;
    assert(
      hasEn && hasHi && hasTe && hasCommands,
      `Explanations present in EN ("${multiData.explanation?.en?.speechText?.slice(0, 40)}..."), HI, TE with ${multiData.explanation?.en?.voiceCommands?.length} voice commands`
    );

    // -------------------------------------------------------------
    // Scenario 9: Auditable Fair Pricing Fields Persisted in Bill
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Bill Persistence with Auditable Fields ---');
    const billRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'bill-test-' + Date.now(),
        billNumber: 'KT-TEST-999',
        sellerId: 'art-01',
        sellerName: 'Balaiah Master Weaver',
        productId: testProdId,
        productName: 'Dual Price Test Ikat Shawl',
        productCategory: 'Handloom',
        quantity: 1,
        materialCost: 800,
        laborHours: 15,
        fairHourlyWage: 100,
        laborValue: 1500,
        baseCost: 2300,
        marginAmount: 575,
        recommendedFairPrice: 2875,
        artisanApprovedPrice: 3000,
        pricingFormulaVersion: 'v1.0-fair-wage',
        finalPrice: 3000,
        totalCost: 2300,
        profit: 700,
        profitPercentage: 30,
        status: 'finalized',
        createdAt: new Date().toISOString()
      })
    });
    const billData = await billRes.json();
    assert(
      billRes.ok &&
      billData.recommendedFairPrice === 2875 &&
      billData.artisanApprovedPrice === 3000 &&
      billData.laborValue === 1500 &&
      billData.pricingFormulaVersion === 'v1.0-fair-wage',
      `Bill created with complete auditable fields: Labor ₹${billData.laborValue}, Recommended ₹${billData.recommendedFairPrice}, Approved ₹${billData.artisanApprovedPrice}`
    );

    // -------------------------------------------------------------
    // Scenario 10: Speech Transcript Attribute Extraction API
    // -------------------------------------------------------------
    console.log('\n--- Test 10: Voice Details Extraction API ---');
    const voiceRes = await fetch(`${BASE_URL}/api/v1/ai/voice-extract-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'I spent 800 rupees on natural silk yarns and worked 15 hours on this ikat sari',
        language: 'en'
      })
    });
    const voiceData = await voiceRes.json();
    assert(
      voiceRes.ok &&
      voiceData.materialCost === 800 &&
      voiceData.laborHours === 15,
      `Voice extractor parsed transcript: Material cost ₹${voiceData.materialCost}, Labor hours ${voiceData.laborHours}h`
    );

  } catch (error) {
    console.error('Fatal error during test suite:', error);
  }

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} / ${total} Scenarios Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
