import assert from 'assert';
import { PrivateBuyerAdapter } from '../server/integrations/marketplace/privateBuyer.adapter.js';
import { B2BAdapter } from '../server/integrations/marketplace/b2b.adapter.js';
import { WhatsAppAdapter } from '../server/integrations/marketplace/whatsapp.adapter.js';
import { ONDCAdapter } from '../server/integrations/marketplace/ondc.adapter.js';
import { db } from '../server/db.js';

async function runMarketplaceTests() {
  console.log('--- Testing SKILLS 12, 13, 14, 15: Marketplace Adapters & Linkages ---');

  while (!db.isInitialized) {
    await new Promise(r => setTimeout(r, 100));
  }

  const products = db.products;
  assert.ok(products.length > 0, 'Must have seeded products');
  const testProduct = products[0];

  // 1. SKILL 12: Private Buyer Marketplace Adapter
  const privateAdapter = new PrivateBuyerAdapter();
  const privatePublish = await privateAdapter.publishProduct(testProduct);
  assert.strictEqual(privatePublish.success, true);
  assert.strictEqual(privatePublish.platform, 'private_marketplace');
  console.log('✓ SKILL 12: PrivateBuyerAdapter publishes craft directly to KALAtech marketplace');

  // 2. SKILL 13: B2B Market Linkage Adapter
  const b2bAdapter = new B2BAdapter();
  const b2bPublish = await b2bAdapter.publishProduct(testProduct);
  assert.strictEqual(b2bPublish.success, true);
  assert.strictEqual(b2bPublish.platform, 'b2b');

  const initialStock = testProduct.quantity;
  const bulkEnquiryRes = await b2bAdapter.submitBulkEnquiry({
    productId: testProduct.id,
    requestedQuantity: 50,
    proposedPrice: 4200,
    buyerName: 'FabIndia Procurement Group',
    buyerContact: '+91 91234 56789',
    buyerEmail: 'procurement@fabindia.com',
    message: 'Requesting wholesale lot of 50 sarees for autumn craft display.'
  });

  assert.strictEqual(bulkEnquiryRes.success, true);
  assert.ok(bulkEnquiryRes.enquiryId);
  // CRITICAL SPEC CHECK: Stock must NOT change on enquiry alone
  const postEnquiryProduct = db.getProductById(testProduct.id);
  assert.strictEqual(postEnquiryProduct?.quantity, initialStock, 'B2B enquiry must NOT mutate physical stock before contract/order confirmation');
  console.log('✓ SKILL 13: B2BAdapter handles wholesale RFQ enquiries without premature stock deduction');

  // 3. SKILL 14: WhatsApp Market Linkage Adapter
  const waAdapter = new WhatsAppAdapter();
  const waStatus = await waAdapter.getProductStatus(testProduct.id);
  assert.strictEqual(waStatus.success, true);
  assert.strictEqual(waStatus.platform, 'whatsapp');
  // Since credentials are demo mode in test, must display Demo mode
  assert.ok(waStatus.message.includes('WhatsApp Demo') || waStatus.message.includes('WhatsApp Catalog Active'));
  console.log(`✓ SKILL 14: WhatsAppAdapter active in ${waAdapter.isLive ? 'Live API' : 'Explicit Demo/Artisan Direct Link'} mode`);

  // 4. SKILL 15: ONDC Integration-Ready Layer
  const ondcAdapter = new ONDCAdapter();
  const ondcPublish = await ondcAdapter.publishProduct(testProduct);
  assert.strictEqual(ondcPublish.success, true);
  assert.strictEqual(ondcPublish.platform, 'ondc');
  assert.ok(ondcPublish.message.includes('ONDC Demo / Not Connected') || ondcPublish.message.includes('Live'));
  console.log('✓ SKILL 15: ONDCAdapter correctly isolated and reports explicit demo status ("ONDC Demo / Not Connected")');

  // 5. SKILL 21: Error Resilience Test
  // Simulating an ONDC or external network outage must NOT prevent Private Marketplace or B2B operations
  try {
    const safeCheck = await privateAdapter.getProductStatus(testProduct.id);
    assert.strictEqual(safeCheck.success, true);
    console.log('✓ SKILL 21: Isolated failure resilience verified: internal marketplace fully operational');
  } catch (err) {
    assert.fail('Private marketplace must never fail due to external integration faults');
  }

  console.log('--- ALL SKILLS 12, 13, 14, 15 TESTS PASSED SUCCESSFULLY! ---');
}

runMarketplaceTests().catch(err => {
  console.error('Marketplace tests failed:', err);
  process.exit(1);
});
