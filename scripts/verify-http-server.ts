import assert from 'node:assert/strict';

async function verifyServer() {
  console.log('Testing live server on http://localhost:3000...\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:3000/api/health');
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  console.log('✓ Health check passed:', healthData);

  // 2. Reverse Geocode (Section 3: Bobbili, Vizianagaram, Andhra Pradesh)
  // Coordinates for Bobbili, AP: 18.57, 83.36
  const geoRes = await fetch('http://localhost:3000/api/location/reverse-geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: 18.57, longitude: 83.36 })
  });
  assert.equal(geoRes.status, 200);
  const geoData = await geoRes.json();
  assert.equal(geoData.success, true);
  assert.ok(geoData.location);
  console.log('✓ Reverse Geocode passed:', geoData.location);

  // 3. AI Craft Inspection endpoint (Section 2)
  const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEfQHz/7l7bAAAAABJRU5ErkJggg==';
  const aiRes = await fetch('http://localhost:3000/api/v1/ai/inspect-craft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: dummyImage,
      language: 'en',
      categoryHint: 'Handloom',
      regionHint: 'Andhra Pradesh'
    })
  });
  assert.equal(aiRes.status, 200);
  const aiData = await aiRes.json();
  assert.equal(aiData.success, true);
  assert.ok(aiData.canonicalAttributes);
  console.log('✓ AI Vision endpoint passed: Craft =', aiData.canonicalAttributes.craftName || aiData.canonicalAttributes.craftCategory);

  // 4. GET /seller/add web route
  const pageRes = await fetch('http://localhost:3000/seller/add');
  assert.equal(pageRes.status, 200);
  const pageHtml = await pageRes.text();
  assert.ok(pageHtml.includes('<!DOCTYPE html>') || pageHtml.includes('<html'));
  assert.ok(pageHtml.includes('/src/main.tsx') || pageHtml.includes('assets/'));
  console.log('✓ Web App route /seller/add served successfully (HTTP 200)');

  console.log('\nAll live HTTP server verification tests passed successfully!');
}

verifyServer().catch(err => {
  console.error('Server verification error:', err);
  process.exit(1);
});
