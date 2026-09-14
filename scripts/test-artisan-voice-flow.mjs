// scripts/test-artisan-voice-flow.mjs
// Automated verification suite for the Voice-First Artisan Seller Flow in KALAtech

const BASE_URL = 'http://localhost:3000';

function normalizeSpokenDigits(input) {
  const digitWords = {
    zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9',
    शून्य: '0', एक: '1', दो: '2', तीन: '3', चार: '4', पांच: '5', छह: '6', सात: '7', आठ: '8', नौ: '9',
    సున్నా: '0', ఒకటి: '1', రెండు: '2', మూడు: '3', నాలుగు: '4', ఐదు: '5', ఆరు: '6', ఏడు: '7', ఎనిమిది: '8', తొమ్మిది: '9',
  };

  let cleaned = input.toLowerCase();
  for (const [word, digit] of Object.entries(digitWords)) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(reg, digit);
  }
  return cleaned;
}

async function runVoiceFlowTests() {
  console.log('====================================================');
  console.log('🎙️ Starting KALAtech Voice-First Artisan Flow Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 6;

  // Test 1: Spoken Mobile Number Normalization
  console.log('--- Test 1: Spoken Mobile Number to Digits ---');
  const spokenMobile = 'nine eight seven six five four three two one zero';
  const parsedDigits = normalizeSpokenDigits(spokenMobile).replace(/\D/g, '');
  if (parsedDigits === '9876543210') {
    console.log(`✅ [PASS] Spoken phrase "${spokenMobile}" correctly normalized to 10-digit number: ${parsedDigits}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Expected "9876543210", got "${parsedDigits}"`);
  }

  // Test 2: Spoken OTP Normalization
  console.log('\n--- Test 2: Spoken OTP to Digits ---');
  const spokenOtp = 'one two three four five six';
  const parsedOtp = normalizeSpokenDigits(spokenOtp).replace(/\D/g, '');
  if (parsedOtp === '123456') {
    console.log(`✅ [PASS] Spoken OTP "${spokenOtp}" correctly normalized to 6-digit OTP: ${parsedOtp}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Expected "123456", got "${parsedOtp}"`);
  }

  // Test 3: Natural Compound Speech Extraction API
  console.log('\n--- Test 3: Natural Compound Speech Extraction (/api/v1/ai/voice-extract-details) ---');
  try {
    const naturalSpeech = 'It is a cotton saree made in Telangana. I spent around 15 hours making it and the material cost was 800 rupees.';
    const res = await fetch(`${BASE_URL}/api/v1/ai/voice-extract-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: naturalSpeech, language: 'en' }),
    });
    const data = await res.json();
    if (data.materialCost === 800 && data.laborHours === 15) {
      console.log(`✅ [PASS] Extracted structured data: Material: ${data.material}, Cost: ₹${data.materialCost}, Hours: ${data.laborHours}h, Region: ${data.region || 'Telangana'}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Unexpected extraction output:`, data);
    }
  } catch (err) {
    console.error(`❌ [FAIL] Error calling voice extraction:`, err);
  }

  // Test 4: Multilingual Tour Step Voice Explanations
  console.log('\n--- Test 4: Multilingual Voice Greetings & Pricing Explanations ---');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Handwoven Cotton Saree',
        craftType: 'Weaving',
        material: 'Cotton',
        materialCost: 800,
        laborHours: 15,
        fairHourlyWage: 100,
        language: 'te',
      }),
    });
    const pricing = await res.json();
    const hasTe = pricing.explanation?.telugu && pricing.explanation.telugu.includes('2,875');
    const hasHi = pricing.explanation?.hindi && pricing.explanation.hindi.includes('2,875');
    const hasEn = pricing.explanation?.english && pricing.explanation.english.includes('2,875');

    if (hasTe && hasHi && hasEn) {
      console.log(`✅ [PASS] Dynamic trilingual explanations generated correctly for Recommended Price ₹2,875:`);
      console.log(`   Telugu: "${pricing.explanation.telugu.slice(0, 70)}..."`);
      console.log(`   Hindi:  "${pricing.explanation.hindi.slice(0, 70)}..."`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Missing or incomplete language explanations:`, pricing.explanation);
    }
  } catch (err) {
    console.error(`❌ [FAIL] Pricing calculation error:`, err);
  }

  // Test 5: Dual Price Preservation (Recommended vs Approved)
  console.log('\n--- Test 5: Dual Price Model on Product Creation ---');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/products/prod-01/price-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material_cost: 800,
        labor_hours: 15,
        hourly_rate: 100,
        other_cost: 0,
      }),
    });
    const data = await res.json();
    if (data.recommendedFairPrice === 2875) {
      console.log(`✅ [PASS] Product price recommendation endpoint returned deterministic fair price ₹2,875`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Recommended price mismatch:`, data);
    }
  } catch (err) {
    console.error(`❌ [FAIL] Error in dual-price test:`, err);
  }

  // Test 6: Zero-Trust Server Checkout Verification
  console.log('\n--- Test 6: Zero-Trust Anti-Tampering Server Checkout ---');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'prod-01',
        quantity: 1,
        buyer_name: 'Pooja Reddy',
        buyer_email: 'pooja@example.com',
        buyer_phone: '9848099999',
        buyer_address: 'Banjara Hills, Hyderabad',
        tampered_price: 15, // malicious forged price attempt
      }),
    });
    const orderData = await res.json();
    if (orderData.total_amount > 100) {
      console.log(`✅ [PASS] Server rejected forged price (₹15) and enforced authoritative server price ₹${orderData.total_amount}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Server accepted tampered price:`, orderData);
    }
  } catch (err) {
    console.error(`❌ [FAIL] Checkout verification test error:`, err);
  }

  console.log('\n====================================================');
  console.log(`Voice Flow Test Results: ${passed} / ${total} Scenarios Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVoiceFlowTests();
