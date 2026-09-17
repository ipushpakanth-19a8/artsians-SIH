import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('==============================================');
  console.log('🧪 VERIFYING AI CRAFT INSPECTION & VOICE FLOW');
  console.log('==============================================\n');

  // Test 1: Frontend Server Reachability
  try {
    const res = await fetch(`${BASE_URL}/seller/handicrafts/new`);
    console.log(`[1] Frontend reachable at http://localhost:3000: Status ${res.status} ${res.ok ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    console.error(`[1] Frontend connection error:`, err.message);
    process.exit(1);
  }

  // Test 2: AI Craft Inspection with Telugu Language
  try {
    const sampleImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const res = await fetch(`${BASE_URL}/api/v1/ai/inspect-craft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: sampleImage,
        language: 'te',
        categoryHint: 'Handloom',
        regionHint: 'Pochampally, Telangana'
      })
    });
    const data = await res.json();
    console.log(`[2] AI Craft Inspection API: Status ${res.status}, Success: ${data.success ? '✓' : '✗'}`);
    console.log(`    Craft Name: "${data.localizedAttributes?.craftName || data.canonicalAttributes?.craftName}"`);
    console.log(`    Technique: "${data.localizedAttributes?.technique || data.canonicalAttributes?.technique}"`);
    console.log(`    Confidence: ${data.confidence}, Provider: ${data.aiProvider}`);
    if (!data.success) throw new Error('AI Craft Inspection failed');
  } catch (err) {
    console.error('[2] AI Craft Inspection test failed:', err.message);
    process.exit(1);
  }

  // Test 3: Spoken Field Extractions across English, Telugu, Hindi
  const testCases = [
    {
      label: 'English Material (Full sentence)',
      targetField: 'material',
      language: 'en',
      transcript: 'It is made of pure cotton fabric.',
      expected: 'cotton'
    },
    {
      label: 'Telugu Material ("పత్తి")',
      targetField: 'material',
      language: 'te',
      transcript: 'ఈ చీర పత్తితో చేనేత ద్వారా తయారు చేయబడింది',
      expected: 'cotton'
    },
    {
      label: 'English Labor Hours (Word number "fifteen hours")',
      targetField: 'laborHours',
      language: 'en',
      transcript: 'I spent around fifteen hours weaving this saree.',
      expected: 15
    },
    {
      label: 'Hindi Labor Hours ("16 घंटे")',
      targetField: 'laborHours',
      language: 'hi',
      transcript: 'मुझे इसे बनाने में 16 घंटे लगे',
      expected: 16
    },
    {
      label: 'English Material Cost ("eight hundred rupees")',
      targetField: 'materialCost',
      language: 'en',
      transcript: 'The raw material cost was eight hundred rupees.',
      expected: 800
    },
    {
      label: 'Telugu Material Cost ("ఖర్చు 850 రూపాయలు")',
      targetField: 'materialCost',
      language: 'te',
      transcript: 'నాకు ముడి సరుకు ఖర్చు 850 రూపాయలు అయ్యింది',
      expected: 850
    },
    {
      label: 'English Quantity ("ten pieces")',
      targetField: 'quantity',
      language: 'en',
      transcript: 'I have ten pieces available in stock.',
      expected: 10
    },
    {
      label: 'Confirmation - Yes',
      targetField: 'confirmation',
      language: 'en',
      transcript: 'Yes, that is correct.',
      check: (d) => d.isConfirmation === true
    },
    {
      label: 'Confirmation - No',
      targetField: 'confirmation',
      language: 'en',
      transcript: 'No, that is not right.',
      check: (d) => d.isRejection === true
    },
    {
      label: 'Voice Correction - "No, it is silk"',
      targetField: 'confirmation',
      language: 'en',
      transcript: 'No, the material is silk actually.',
      check: (d) => d.canonicalValue === 'silk'
    }
  ];

  console.log('\n[3] Testing Voice Field Extractions:');
  let passedCount = 0;
  for (const tc of testCases) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ai/voice-extract-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: tc.transcript,
          targetField: tc.targetField,
          language: tc.language,
          currentFormState: {}
        })
      });
      const data = await res.json();

      let isMatch = false;
      if (tc.check) {
        isMatch = tc.check(data);
      } else {
        isMatch = data.canonicalValue === tc.expected;
      }

      if (isMatch) {
        console.log(`  ✓ ${tc.label}: extracted -> ${JSON.stringify(data.canonicalValue ?? { isConfirmation: data.isConfirmation, isRejection: data.isRejection })}`);
        passedCount++;
      } else {
        console.error(`  ✗ ${tc.label} FAILED! Got: ${JSON.stringify(data)}, Expected: ${tc.expected}`);
      }
    } catch (err) {
      console.error(`  ✗ ${tc.label} ERROR:`, err.message);
    }
  }

  console.log(`\nResults: ${passedCount}/${testCases.length} voice extraction test cases passed.`);
  if (passedCount === testCases.length) {
    console.log('\n🎉 ALL AI CRAFT INSPECTION & VOICE FLOW TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests();
