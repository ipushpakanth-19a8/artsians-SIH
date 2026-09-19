import assert from 'assert';
import { db } from '../server/db.js';

async function runProvenanceTests() {
  console.log('--- Testing SKILL 16: QR Provenance ---');

  // 1. Get an existing product ID from db
  const products = db.products;
  assert.ok(products.length > 0, 'Database must have products');
  const targetProduct = products[0];

  console.log(`Testing provenance for product ID: "${targetProduct.id}" (${targetProduct.title})`);

  // 2. Fetch from running server
  const response = await fetch(`http://localhost:3000/api/v1/provenance/${targetProduct.id}`);
  assert.strictEqual(response.status, 200, 'Provenance endpoint must return 200 OK');

  const json = await response.json();
  assert.strictEqual(json.success, true, 'Response must be successful');
  assert.ok(json.provenance, 'Must contain provenance object');

  const prov = json.provenance;
  console.log('[Provenance Result]:', {
    provenanceId: prov.provenanceId,
    craftName: prov.craftName,
    craftType: prov.craftType,
    artisan: prov.artisan.name,
    origin: `${prov.origin.district}, ${prov.origin.state}`,
    tamperHash: prov.tamperHash?.substring(0, 16) + '...'
  });

  // Verify exact required fields
  assert.ok(prov.provenanceId && prov.provenanceId.startsWith('PRV-'), 'Must have valid PRV- provenance ID');
  assert.strictEqual(prov.productId, targetProduct.id);
  assert.ok(prov.craftName);
  assert.ok(prov.craftType);
  assert.ok(prov.origin.district);
  assert.ok(prov.origin.state);
  assert.ok(prov.artisan.name);
  assert.ok(prov.creationDetails.materials);
  assert.ok(prov.creationDetails.technique);
  assert.ok(prov.tamperHash);
  assert.strictEqual(prov.verifiedAuthenticity, true);

  // Safety test: statement must emphasize direct artisan sourcing and NOT claim false unverified certificates
  assert.ok(prov.statement.includes('Verifiable authenticity record'));
  assert.ok(!prov.statement.includes('UNESCO') && !prov.statement.includes('Ancient 5000 BC'));
  console.log('✓ SKILL 16: Provenance record generated with authentic artisan details and tamper hash');

  // 3. Test 404 for non-existent product
  const notFoundRes = await fetch('http://localhost:3000/api/v1/provenance/non-existent-craft-999');
  assert.strictEqual(notFoundRes.status, 404, 'Non-existent craft must return 404');
  console.log('✓ SKILL 16: Non-existent product cleanly returns 404');

  console.log('--- ALL SKILL 16 TESTS PASSED SUCCESSFULLY! ---');
}

runProvenanceTests().catch(err => {
  console.error('Provenance test failed:', err);
  process.exit(1);
});
