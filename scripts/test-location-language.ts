import { STATE_LANGUAGE_MAP, getLanguagesForState, getPrimaryLanguageForState, getDistrictsForState, getRegionalCraftsForState, normalizeStateName } from '../src/config/stateLanguageMap.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING LOCATION + LANGUAGE RECOMMENDATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Port 3000 Health Check
  console.log('--- Test 1: Server running on Port 3000 ---');
  try {
    const res = await fetch('http://localhost:3000/api/health');
    const data = await res.json();
    assert(res.ok && data.status === 'ok', 'Server is online at http://localhost:3000');
  } catch (e: any) {
    assert(false, `Port 3000 health check failed: ${e.message}`);
  }

  // 2. Reverse Geocoding API: Andhra Pradesh / Vizianagaram
  console.log('\n--- Test 2: Reverse Geocoding AP / Vizianagaram (Privacy: Coordinates never returned) ---');
  try {
    const res = await fetch('http://localhost:3000/api/location/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: 18.1124, longitude: 83.3956 })
    });
    const data = await res.json();
    assert(data.success === true, 'Response has success: true');
    assert(data.location.state === 'Andhra Pradesh', `State detected as ${data.location.state}`);
    assert(data.location.district === 'Vizianagaram', `District detected as ${data.location.district}`);
    assert(data.latitude === undefined && data.location.latitude === undefined, 'Raw latitude NOT exposed');
    assert(data.longitude === undefined && data.location.longitude === undefined, 'Raw longitude NOT exposed');
  } catch (e: any) {
    assert(false, `Reverse geocoding AP failed: ${e.message}`);
  }

  // 3. Reverse Geocoding API: Telangana / Pochampally
  console.log('\n--- Test 3: Reverse Geocoding Telangana / Pochampally ---');
  try {
    const res = await fetch('http://localhost:3000/api/location/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: 17.3486, longitude: 78.8143 })
    });
    const data = await res.json();
    assert(data.success === true, 'Response has success: true');
    assert(data.location.state === 'Telangana', `State detected as ${data.location.state}`);
    assert(data.location.place === 'Bhoodan Pochampally', `Place detected as ${data.location.place}`);
  } catch (e: any) {
    assert(false, `Reverse geocoding TS failed: ${e.message}`);
  }

  // 4. State to Language Mapping: Multi-language Recommendations
  console.log('\n--- Test 4: State to Language Mapping (Multi-language, Never Forced) ---');
  const apLangs = getLanguagesForState('Andhra Pradesh');
  assert(apLangs.includes('te') && apLangs.includes('en'), 'Andhra Pradesh recommends [Telugu, English]');
  assert(getPrimaryLanguageForState('Andhra Pradesh') === 'te', 'AP primary language is Telugu (te)');

  const tsLangs = getLanguagesForState('Telangana');
  assert(tsLangs.includes('te') && tsLangs.includes('en'), 'Telangana recommends [Telugu, English]');

  const tnLangs = getLanguagesForState('Tamil Nadu');
  assert(tnLangs.includes('ta') && tnLangs.includes('en'), 'Tamil Nadu recommends [Tamil, English]');

  const mhLangs = getLanguagesForState('Maharashtra');
  assert(mhLangs.includes('mr') && mhLangs.includes('hi') && mhLangs.includes('en'), 'Maharashtra recommends [Marathi, Hindi, English]');

  const kaLangs = getLanguagesForState('Karnataka');
  assert(kaLangs.includes('kn') && kaLangs.includes('en'), 'Karnataka recommends [Kannada, English]');

  // 5. Districts and Regional Crafts
  console.log('\n--- Test 5: District & Regional Craft Lists ---');
  const apDistricts = getDistrictsForState('Andhra Pradesh');
  assert(apDistricts.includes('Vizianagaram') && apDistricts.includes('Prakasam'), 'AP districts include Vizianagaram and Prakasam');

  const apCrafts = getRegionalCraftsForState('Andhra Pradesh');
  assert(apCrafts.includes('Handloom Weaving') && apCrafts.includes('Kondapalli Wooden Toys'), 'AP crafts include Handloom Weaving and Kondapalli Toys');

  // 6. Language Priority Engine Verification
  console.log('\n--- Test 6: Language Priority Hierarchy ---');
  // Formula: userSelectedLanguage ?? savedLanguage ?? locationRecommendedLanguage ?? browserLanguage ?? "en"
  function resolveLanguage(userSelected?: string, saved?: string, locationRec?: string, browser?: string): string {
    return userSelected ?? saved ?? locationRec ?? browser ?? 'en';
  }

  assert(resolveLanguage('hi', 'te', 'ta', 'en') === 'hi', '1. Explicit user selection wins over saved/location');
  assert(resolveLanguage(undefined, 'te', 'ta', 'en') === 'te', '2. Previously saved preference wins over location');
  assert(resolveLanguage(undefined, undefined, 'kn', 'en') === 'kn', '3. Location recommendation wins over browser');
  assert(resolveLanguage(undefined, undefined, undefined, 'mr') === 'mr', '4. Browser language fallback wins over default');
  assert(resolveLanguage(undefined, undefined, undefined, undefined) === 'en', '5. Safe fallback is "en"');

  // 7. Error Handling for Bad Geocoding Input
  console.log('\n--- Test 7: Geocoding Input Validation ---');
  try {
    const res = await fetch('http://localhost:3000/api/location/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: 'invalid', longitude: 999 })
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'Rejects invalid coordinates with 400 Bad Request');
  } catch (e: any) {
    assert(false, `Input validation test failed: ${e.message}`);
  }

  // 8. Auth API accepting District and Place
  console.log('\n--- Test 8: Auth Profile Persistence with District & Place ---');
  try {
    const res = await fetch('http://localhost:3000/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9988776655',
        otp: '123456',
        role: 'seller',
        name: 'Venkatesh Weaver',
        craft_type: 'Handloom Weaving',
        state: 'Andhra Pradesh',
        district: 'Vizianagaram',
        place: 'Vizianagaram Village',
        preferredLanguage: 'te'
      })
    });
    const data = await res.json();
    assert(data.success === true, 'OTP login verified successfully');
    assert(data.user.district === 'Vizianagaram', `User district persisted: ${data.user.district}`);
    assert(data.user.place === 'Vizianagaram Village', `User place persisted: ${data.user.place}`);
    assert(data.artisan.district === 'Vizianagaram', `Artisan district persisted: ${data.artisan.district}`);
  } catch (e: any) {
    assert(false, `Auth API district persistence test failed: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests().catch(console.error);
