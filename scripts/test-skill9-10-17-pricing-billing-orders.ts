import assert from 'assert';
import { PricingService } from '../server/services/pricing.service.js';
import { OrderService } from '../server/services/order.service.js';
import { db } from '../server/db.js';

async function runPricingBillingOrdersTests() {
  console.log('--- Testing SKILL 9 (Fair Pricing), SKILL 10 (Billing & Checkout), SKILL 17 (Orders & Inventory) ---');

  // 1. Test Deterministic Fair Pricing formula as per specification
  // Inputs: material = 800, laborHours = 20, hourlyWage = 150, targetMargin = 0.20 (20%)
  // Expected: labor = 3000, productionCost = 3800, fair price = 4750
  const pricingResult = await PricingService.calculateFairPrice({
    materialCost: 800,
    laborHours: 20,
    fairHourlyWage: 150,
    targetMargin: 0.20,
    category: 'textiles'
  });

  console.log('[Test 1] Pricing result:', {
    laborCost: pricingResult.laborCost,
    productionCost: pricingResult.productionCost,
    recommendedFairPrice: pricingResult.recommendedFairPrice,
    artisanApprovedPrice: pricingResult.artisanApprovedPrice
  });

  assert.strictEqual(pricingResult.laborCost, 3000, 'Labor cost must be 20 * 150 = 3000');
  assert.strictEqual(pricingResult.productionCost, 3800, 'Production cost must be 800 + 3000 = 3800');
  assert.strictEqual(pricingResult.recommendedFairPrice, 4750, 'Recommended fair price must be 3800 / 0.8 = 4750');
  console.log('✓ SKILL 9: Deterministic Fair Price calculation matches specification exactly (4,750)');

  // 2. Test Separation of recommendedFairPrice vs artisanApprovedPrice
  const customApproved = await PricingService.calculateFairPrice({
    materialCost: 800,
    laborHours: 20,
    fairHourlyWage: 150,
    targetMargin: 0.20,
    artisanApprovedPrice: 5000,
    category: 'textiles'
  });

  assert.strictEqual(customApproved.recommendedFairPrice, 4750);
  assert.strictEqual(customApproved.artisanApprovedPrice, 5000);
  console.log('✓ SKILL 9: recommendedFairPrice and artisanApprovedPrice maintained separately');

  // 3. Test Invalid Pricing Input validation
  const invalidWage = PricingService.validatePricingInputs({ materialCost: 500, fairHourlyWage: -10 });
  assert.strictEqual(invalidWage.valid, false, 'Negative wage must be invalid');

  const invalidMargin = PricingService.validatePricingInputs({ targetMargin: 1.5 });
  assert.strictEqual(invalidMargin.valid, false, 'Margin >= 1 must be invalid');
  console.log('✓ SKILL 9: Pricing input validation prevents negative values and invalid margins');

  // 4. Test Billing & Checkout calculation
  // Create or retrieve a test product in db using an existing artisan from seed
  const existingArtisans = db.artisans;
  const artisanId = existingArtisans.length > 0 ? existingArtisans[0].id : 'art-01';
  const artisanName = existingArtisans.length > 0 ? existingArtisans[0].name : 'Lakshmi Devi';

  const testProduct = db.createProduct({
    artisan_id: artisanId,
    artisan_name: artisanName,
    artisan_phone: '+91 9876543210',
    title: 'Test Pochampally Ikat Silk Saree',
    category: 'Handloom Saree',
    description: 'Authentic handwoven silk saree',
    recommendedFairPrice: 4750,
    artisanApprovedPrice: 5000,
    quantity: 10,
    status: 'published',
    images: ['https://example.com/saree.jpg']
  });

  const bill = OrderService.calculateCheckoutBill({
    productId: testProduct.id,
    quantity: 2
  });

  console.log('[Test 2] Checkout bill:', {
    unitPrice: bill.unitPrice,
    quantity: bill.quantity,
    subtotal: bill.subtotal,
    shipping: bill.shipping,
    tax: bill.tax,
    total: bill.total
  });

  // Server authoritative: uses artisanApprovedPrice (5000)
  assert.strictEqual(bill.unitPrice, 5000, 'Checkout must use artisanApprovedPrice (5000)');
  assert.strictEqual(bill.quantity, 2);
  assert.strictEqual(bill.subtotal, 10000, 'Subtotal must be 5000 * 2 = 10000');
  // Free shipping above 1500 -> 0
  assert.strictEqual(bill.shipping, 0);
  // 5% GST on 10000 -> 500
  assert.strictEqual(bill.tax, 500);
  assert.strictEqual(bill.total, 10500, 'Total must be 10000 + 0 + 500 = 10500');
  console.log('✓ SKILL 10: Server-side billing calculation verified (subtotal, shipping, tax, total)');

  // 5. Test Overselling / Inventory Guard
  assert.throws(() => {
    OrderService.calculateCheckoutBill({
      productId: testProduct.id,
      quantity: 100
    });
  }, /exceeds available stock/, 'Must prevent overselling');
  console.log('✓ SKILL 10 & 17: Overselling prevented');

  // 6. Test Finalizing Order & Inventory Decrement
  const initialStock = testProduct.quantity;
  const orderResult = await OrderService.finalizeOrder({
    productId: testProduct.id,
    quantity: 3,
    buyerName: 'Priya Sharma',
    buyerPhone: '+91 99999 88888',
    buyerAddress: 'Banjara Hills, Hyderabad',
    paymentMethod: 'upi_direct'
  });

  assert.strictEqual(orderResult.success, true);
  assert.strictEqual(orderResult.newStock, initialStock - 3, 'Inventory must decrement authoritatively');
  const updatedProduct = db.getProductById(testProduct.id);
  assert.strictEqual(updatedProduct?.quantity, initialStock - 3);
  console.log('✓ SKILL 17: Order finalized, inventory decremented authoritatively from', initialStock, 'to', updatedProduct?.quantity);

  console.log('--- ALL SKILL 9, 10, 17 TESTS PASSED SUCCESSFULLY! ---');
}

runPricingBillingOrdersTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
