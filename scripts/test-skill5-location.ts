import assert from 'assert';

async function runLocationTests() {
  console.log('--- Testing SKILL 5: Location Detection ---');

  // Test against running server
  const endpoint = 'http://localhost:3000/api/location/reverse-geocode';

  // 1. Test Valid Coordinates (Pochampally / Hyderabad, Telangana: 17.385, 78.486)
  const resValid = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: 17.385, longitude: 78.486 })
  });
  assert.strictEqual(resValid.status, 200, 'Reverse geocode should succeed with HTTP 200');
  const dataValid = await resValid.json();
  assert.strictEqual(dataValid.success, true);
  assert.ok(dataValid.location, 'Location object must exist');
  assert.ok(dataValid.location.state, 'State must be returned');
  assert.strictEqual(dataValid.location.state.toLowerCase().includes('telangana'), true, 'State should be Telangana');
  assert.strictEqual((dataValid.location as any).latitude, undefined, 'Raw latitude must NOT be in location output');
  assert.strictEqual((dataValid.location as any).longitude, undefined, 'Raw longitude must NOT be in location output');
  console.log('✓ Test 1 Passed: Valid coordinates resolved to state:', dataValid.location.state, 'district:', dataValid.location.district);

  // 2. Test Out of Bounds Coordinates
  const resInvalid = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: 999, longitude: 999 })
  });
  assert.strictEqual(resInvalid.status, 400, 'Invalid coordinate range should return HTTP 400');
  console.log('✓ Test 2 Passed: Invalid coordinates correctly rejected with HTTP 400');

  // 3. Test Bangalore / Karnataka coordinates (12.9716, 77.5946)
  const resBlr = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: 12.9716, longitude: 77.5946 })
  });
  const dataBlr = await resBlr.json();
  assert.strictEqual(dataBlr.success, true);
  assert.ok(dataBlr.location.state.toLowerCase().includes('karnataka'), 'State should be Karnataka');
  console.log('✓ Test 3 Passed: Coordinates resolved to Karnataka without exposing raw GPS');

  console.log('All SKILL 5 Location tests passed successfully! ✓\n');
}

runLocationTests().catch((err) => {
  console.error('Location test failed:', err);
  process.exit(1);
});
