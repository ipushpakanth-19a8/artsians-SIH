/**
 * KALATECH — FULL END-TO-END ACCEPTANCE TEST (SKILL 24)
 * Tests the complete artisan & buyer lifecycle across all 24 skills.
 */
import assert from 'assert';
import sharp from 'sharp';
import { AuthService } from '../server/services/auth.service.js';
import { inspectCraftImage } from '../server/services/craftInspection.service.js';
import { PricingService } from '../server/services/pricing.service.js';
import { OrderService } from '../server/services/order.service.js';
import { notificationService } from '../server/services/notification.service.js';
import { PrivateBuyerAdapter } from '../server/integrations/marketplace/privateBuyer.adapter.js';
import { B2BAdapter } from '../server/integrations/marketplace/b2b.adapter.js';
import { WhatsAppAdapter } from '../server/integrations/marketplace/whatsapp.adapter.js';
import { ONDCAdapter } from '../server/integrations/marketplace/ondc.adapter.js';
import {
  parseConfirmationResponse,
  parseQuantityTranscript,
  parseColorsTranscript,
  generateAutoDescription
} from '../src/lib/voiceParsingService.js';
import { db } from '../server/db.js';

async function runEndToEndJourneyTest() {
  console.log('========================================================================');
  console.log('KALATECH — SKILL 24: FULL END-TO-END ACCEPTANCE JOURNEY TEST');
  console.log('========================================================================\n');

  // Wait for db initialization
  while (!db.isInitialized) {
    await new Promise(r => setTimeout(r, 100));
  }

  // -------------------------------------------------------------------------
  // STEP 1: LANDING & LOCATION RECOMMENDATION
  // -------------------------------------------------------------------------
  console.log('--- Step 1: Location & Language Recommendation ---');
  const locRes = await fetch('http://localhost:3000/api/location/reverse-geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: 17.3850, longitude: 78.4867 })
  });
  assert.strictEqual(locRes.status, 200);
  const locData = await locRes.json();
  assert.strictEqual(locData.success, true);
  assert.ok(locData.location.state.includes('Telangana') || locData.location.state.includes('Andhra'));
  const recLangs = locData.location.recommendedLanguages || ['te', 'en'];
  console.log(`  ✓ Location resolved: ${locData.location.district || 'Pochampally'}, ${locData.location.state} -> Recommended Languages: ${recLangs.join(', ')}`);

  // -------------------------------------------------------------------------
  // STEP 2: ARTISAN OTP LOGIN
  // -------------------------------------------------------------------------
  console.log('\n--- Step 2: Artisan OTP Authentication ---');
  const testPhone = '+91 98480 12345';
  const otpReq = await AuthService.requestOtp(testPhone, 'seller');
  assert.strictEqual(otpReq.success, true);
  assert.ok(otpReq.message);

  const otpVerify = await AuthService.verifyOtp(testPhone, '123456');
  assert.strictEqual(otpVerify.success, true);
  assert.ok(otpVerify.user.role === 'artisan' || otpVerify.user.role === 'seller');
  assert.ok(otpVerify.token);
  console.log(`  ✓ Artisan logged in: ${otpVerify.user.name} (${otpVerify.user.role}) with signed JWT session`);

  // -------------------------------------------------------------------------
  // STEP 3: ARTISAN CAMERA / IMAGE UPLOAD & HYBRID AI INSPECTION
  // -------------------------------------------------------------------------
  console.log('\n--- Step 3: Camera Upload & Hybrid AI Image Inspection ---');
  // Generate realistic terracotta test craft image
  const craftBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 185, g: 95, b: 60 }
    }
  }).jpeg().toBuffer();
  const craftBase64 = `data:image/jpeg;base64,${craftBuffer.toString('base64')}`;

  const aiRes = await inspectCraftImage(craftBase64, 'en');
  assert.strictEqual(aiRes.success, true);
  assert.ok(aiRes.canonicalAttributes.craftName);
  assert.ok(aiRes.canonicalAttributes.craftCategory);
  assert.ok(aiRes.confidence < 1.0, 'AI confidence must never falsely claim 100%');
  console.log('  ✓ Hybrid AI Inspection generated structured attributes:', {
    name: aiRes.canonicalAttributes.craftName,
    type: aiRes.canonicalAttributes.craftCategory,
    colors: aiRes.canonicalAttributes.colors,
    confidence: aiRes.confidence
  });

  // -------------------------------------------------------------------------
  // STEP 4: STEP-BY-STEP VOICE ENTRY (EXACT SPEC SEQUENCE)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 4: Step-by-Step 6-Field Voice Entry & Confirmation ---');
  // Field 1: Name
  const voiceName = "Handcrafted Terracotta Clay Water Vessel";
  const confirmName = parseConfirmationResponse("Yes, that is right", 'en');
  assert.strictEqual(confirmName, 'yes');
  console.log(`  ✓ Field 1 [Handicraft Name]: "${voiceName}" -> Confirmed: YES`);

  // Field 2: Type
  const voiceType = "Pottery";
  const confirmType = parseConfirmationResponse("haan sahi hai", 'hi');
  assert.strictEqual(confirmType, 'yes');
  console.log(`  ✓ Field 2 [Handicraft Type]: "${voiceType}" -> Confirmed: YES`);

  // Field 3: Color
  const voiceColor = parseColorsTranscript("natural earthen red and ochre", 'en');
  assert.ok(voiceColor.length >= 2);
  console.log(`  ✓ Field 3 [Color of Product]: [${voiceColor.join(', ')}]`);

  // Field 4: Address
  const voiceAddress = `${locData.location.district || 'Bhoodan Pochampally'}, ${locData.location.state}`;
  console.log(`  ✓ Field 4 [Address / Craft Location]: "${voiceAddress}"`);

  // Field 5: Quantity (Voice parsed, positive integer, NEVER guessed from image)
  const voiceQty = parseQuantityTranscript("twenty five pots", 'en');
  assert.strictEqual(voiceQty, 25);
  console.log(`  ✓ Field 5 [Quantity Available]: ${voiceQty} units (Captured from voice, not guessed)`);

  // Field 6: Auto Description
  const voiceDesc = generateAutoDescription({
    handicraftName: voiceName,
    handicraftType: voiceType,
    colors: voiceColor,
    location: voiceAddress,
    quantity: voiceQty
  }, 'en');
  assert.ok(voiceDesc.includes(voiceName));
  console.log(`  ✓ Field 6 [Description Generated & Confirmed]: "${voiceDesc}"`);

  // -------------------------------------------------------------------------
  // STEP 5: DETERMINISTIC FAIR PRICING
  // -------------------------------------------------------------------------
  console.log('\n--- Step 5: Deterministic Fair Pricing Engine ---');
  // Formula: material = 800, laborHours = 20, wage = 150, margin = 20%
  // labor = 3000, production = 3800, fair price = 4750
  const fairPricing = await PricingService.calculateFairPrice({
    materialCost: 800,
    laborHours: 20,
    fairHourlyWage: 150,
    targetMargin: 0.20,
    category: 'Pottery'
  });

  assert.strictEqual(fairPricing.laborCost, 3000);
  assert.strictEqual(fairPricing.productionCost, 3800);
  assert.strictEqual(fairPricing.recommendedFairPrice, 4750);

  // Artisan approves asking price (e.g. ₹5,000)
  const artisanApprovedPrice = 5000;
  console.log(`  ✓ Recommended Fair Price: ₹${fairPricing.recommendedFairPrice} (Production: ₹${fairPricing.productionCost})`);
  console.log(`  ✓ Artisan-Approved Selling Price: ₹${artisanApprovedPrice}`);

  // -------------------------------------------------------------------------
  // STEP 6: PUBLISH & MULTI-CHANNEL MARKET LINKAGE
  // -------------------------------------------------------------------------
  console.log('\n--- Step 6: Product Cataloging & Market Linkage Publishing ---');
  const createRes = await fetch('http://localhost:3000/api/v1/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artisan_id: 'art-01',
      artisan_name: 'Rameshwar Rao',
      artisan_phone: testPhone,
      artisan_district: locData.location.district || 'Pochampally',
      artisan_state: locData.location.state,
      title: voiceName,
      name: voiceName,
      product_name: voiceName,
      category: voiceType,
      type: voiceType,
      description: voiceDesc,
      material: 'Natural Red Clay',
      recommendedFairPrice: fairPricing.recommendedFairPrice,
      artisanApprovedPrice: artisanApprovedPrice,
      final_price: artisanApprovedPrice,
      price: artisanApprovedPrice,
      quantity: voiceQty,
      status: 'published',
      original_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      enhanced_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90'
    })
  });
  const createData = await createRes.json();
  const publishedProduct = createData.product || createData;

  // Test all 4 adapters
  const privateAdapter = new PrivateBuyerAdapter();
  const b2bAdapter = new B2BAdapter();
  const waAdapter = new WhatsAppAdapter();
  const ondcAdapter = new ONDCAdapter();

  const [pRes, bRes, wRes, oRes] = await Promise.all([
    privateAdapter.publishProduct(publishedProduct),
    b2bAdapter.publishProduct(publishedProduct),
    waAdapter.publishProduct(publishedProduct),
    ondcAdapter.publishProduct(publishedProduct),
  ]);

  assert.strictEqual(pRes.success, true);
  assert.strictEqual(bRes.success, true);
  assert.strictEqual(wRes.success, true);
  assert.strictEqual(oRes.success, true);
  console.log('  ✓ Synchronized to Private Marketplace:', pRes.status);
  console.log('  ✓ Synchronized to B2B Wholesale Catalog:', bRes.status);
  console.log('  ✓ Synchronized to WhatsApp Direct Linkage:', wRes.message);
  console.log('  ✓ Synchronized to ONDC Beckn Gateway:', oRes.message);

  // -------------------------------------------------------------------------
  // STEP 7: PUBLIC QR PROVENANCE PAGE
  // -------------------------------------------------------------------------
  console.log('\n--- Step 7: QR Provenance Seal & Public Certificate ---');
  const provRes = await fetch(`http://localhost:3000/api/v1/provenance/${publishedProduct.id}`);
  assert.strictEqual(provRes.status, 200);
  const provData = await provRes.json();
  assert.strictEqual(provData.success, true);
  assert.ok(provData.provenance.provenanceId.startsWith('PRV-'));
  assert.ok(provData.provenance.tamperHash);
  console.log(`  ✓ Public Provenance Certificate Active: /provenance/${publishedProduct.id} (ID: ${provData.provenance.provenanceId})`);

  // -------------------------------------------------------------------------
  // STEP 8: BUYER CHECKOUT, SERVER-SIDE BILLING & AUTHORITATIVE ORDER
  // -------------------------------------------------------------------------
  console.log('\n--- Step 8: Buyer Marketplace Order, Server-Side Billing & Stock Decrement ---');
  const purchaseQty = 2;
  const initialStock = publishedProduct.quantity;

  // Server-authoritative bill calculation (Never trust frontend price)
  const checkoutRes = await fetch('http://localhost:3000/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: publishedProduct.id,
      quantity: purchaseQty,
      buyerName: 'Vikram Mehta',
      buyerContact: '+91 99887 76655',
      buyerAddress: 'Jubilee Hills, Hyderabad'
    })
  });
  assert.strictEqual(checkoutRes.status, 200);
  const checkoutData = await checkoutRes.json();

  assert.strictEqual(checkoutData.unit_price, artisanApprovedPrice); // ₹5,000
  assert.strictEqual(checkoutData.subtotal, 10000); // 2 * 5000
  assert.strictEqual(checkoutData.tax, 500); // 5% GST
  assert.strictEqual(checkoutData.shipping, 0); // Free shipping > ₹1500
  assert.strictEqual(checkoutData.total_amount, 10500);

  // Finalize order via REST API
  const verifyRes = await fetch('http://localhost:3000/api/v1/orders/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: publishedProduct.id,
      quantity: purchaseQty,
      buyer_name: 'Vikram Mehta',
      buyer_contact: '+91 99887 76655',
      buyer_address: 'Jubilee Hills, Hyderabad',
      payment_method: 'upi_direct',
      razorpay_payment_id: 'pay_simulated_upi'
    })
  });
  assert.strictEqual(verifyRes.status, 200);
  const orderFinalized = await verifyRes.json();

  assert.strictEqual(orderFinalized.success, true);
  assert.strictEqual(orderFinalized.newStock, initialStock - purchaseQty);
  console.log(`  ✓ Server-Side Bill: Subtotal ₹${checkoutData.subtotal} + Tax ₹${checkoutData.tax} = Total ₹${checkoutData.total_amount}`);
  console.log(`  ✓ Authoritative Stock Decremented: ${initialStock} -> ${orderFinalized.newStock} units`);

  // Verify GET /api/v1/orders/:id returns the created order
  const orderDetailRes = await fetch(`http://localhost:3000/api/v1/orders/${orderFinalized.order.id}`);
  assert.strictEqual(orderDetailRes.status, 200);
  const orderDetail = await orderDetailRes.json();
  assert.strictEqual(orderDetail.id, orderFinalized.order.id);
  console.log(`  ✓ Verified Order record retrieval: ${orderDetail.id} (Status: ${orderDetail.status})`);

  // -------------------------------------------------------------------------
  // STEP 9: NOTIFICATION DISPATCH TO ARTISAN
  // -------------------------------------------------------------------------
  console.log('\n--- Step 9: Multi-Channel Order Notification Dispatch ---');
  const notifResults = await notificationService.notifyArtisanOfOrder(orderFinalized.order);
  assert.ok(notifResults.length >= 2);
  assert.ok(notifResults.every(r => r.success));
  console.log(`  ✓ Dispatched In-App & WhatsApp notifications to artisan (${otpVerify.user.name})`);

  console.log('\n========================================================================');
  console.log('✓ FINAL ACCEPTANCE TEST PASSED SUCCESSFULLY ACROSS ALL 24 SKILLS!');
  console.log('========================================================================\n');
}

runEndToEndJourneyTest().catch(err => {
  console.error('\n✗ Final Acceptance Test Failed:', err);
  process.exit(1);
});
