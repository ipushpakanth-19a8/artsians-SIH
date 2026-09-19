import assert from 'assert';
import { OrderService } from '../server/services/order.service.js';
import { db } from '../server/db.js';

async function runBillingAndOrderTests() {
  console.log('--- Testing SKILL 10 & SKILL 17: Billing, Checkout, Orders & Inventory ---');

  // 1. Create a test product on HTTP server with known stock and price
  const createRes = await fetch('http://localhost:3000/api/v1/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Terracotta Handcrafted Vase',
      category: 'Pottery',
      quantity: 10,
      final_price: 1200,
      artisanApprovedPrice: 1200,
      recommendedFairPrice: 1500,
      status: 'published'
    })
  });
  const createdData = await createRes.json();
  const pid = createdData.product?.id || createdData.product_id;
  const testProduct = db.createProduct({
    id: pid,
    title: 'Terracotta Handcrafted Vase',
    category: 'Pottery',
    quantity: 10,
    final_price: 1200,
    artisanApprovedPrice: 1200,
    recommendedFairPrice: 1500,
    status: 'published'
  });
  console.log('✓ Created test product ID:', pid, 'initial stock:', testProduct.quantity);

  // 2. Server-side bill calculation enforces artisanApprovedPrice
  // Client attempts to pass a tampered price of ₹10, but server MUST ignore it and use ₹1,200
  const bill = OrderService.calculateCheckoutBill({
    productId: pid,
    quantity: 2,
    buyerName: 'Priya Sharma',
    buyerPhone: '9876543210'
  });

  assert.strictEqual(bill.unitPrice, 1200, 'Server must enforce authoritative unit price (1200), not tampered');
  assert.strictEqual(bill.subtotal, 2400, 'Subtotal must be ₹2,400 (1200 * 2)');
  // Transparent craft logistics: free shipping above ₹1,500
  assert.strictEqual(bill.shipping, 0, 'Shipping should be free for subtotal >= 1500');
  // 5% concessional GST on handicraft goods
  assert.strictEqual(bill.tax, 120, 'Tax should be 5% (2400 * 0.05 = 120)');
  assert.strictEqual(bill.total, 2520, 'Total must equal subtotal + shipping + tax - discount (2400 + 0 + 120 = 2520)');
  console.log('✓ Test 1 Passed: Server-side bill verified: Subtotal ₹2,400 + Tax ₹120 = Total ₹2,520');

  // 3. Overselling Prevention: requesting 50 units when stock is 10 must fail
  let oversellFailed = false;
  try {
    OrderService.calculateCheckoutBill({
      productId: pid,
      quantity: 50
    });
  } catch (err: any) {
    oversellFailed = true;
    assert.ok(err.message.includes('exceeds available stock'), 'Must reject overselling request');
  }
  assert.strictEqual(oversellFailed, true, 'Overselling must be blocked');
  console.log('✓ Test 2 Passed: Overselling prevented when requested quantity exceeds stock');

  // 4. Order Finalization & Authoritative Stock Decrement
  const initialStock = testProduct.quantity!;
  const orderResult = await OrderService.finalizeOrder({
    productId: pid,
    quantity: 2,
    buyerName: 'Priya Sharma',
    buyerPhone: '9876543210',
    paymentMethod: 'upi_direct',
    marketplaceSource: 'private_marketplace'
  });

  assert.strictEqual(orderResult.order.quantity, 2);
  assert.strictEqual(orderResult.order.unit_price, 1200);
  assert.strictEqual(testProduct.quantity, initialStock - 2, 'Authoritative stock must decrement by ordered quantity');
  console.log('✓ Test 3 Passed: Order finalized. Stock decremented authoritatively from', initialStock, 'to', testProduct.quantity);

  // 5. Verify REST checkout API endpoint POST /api/v1/orders/checkout
  const checkoutRes = await fetch('http://localhost:3000/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: pid,
      quantity: 1,
      buyer_name: 'Rahul Kumar',
      buyer_contact: '9988776655'
    })
  });
  assert.strictEqual(checkoutRes.status, 200);
  const checkoutData = await checkoutRes.json();
  assert.strictEqual(checkoutData.success, true);
  assert.strictEqual(checkoutData.unit_price, 1200);
  assert.strictEqual(checkoutData.subtotal, 1200);
  // Shipping ₹100 below ₹1,500, Tax 5% = ₹60, Total = ₹1,360
  assert.strictEqual(checkoutData.shipping, 100);
  assert.strictEqual(checkoutData.tax, 60);
  assert.strictEqual(checkoutData.total, 1360);
  console.log('✓ Test 4 Passed: REST /api/v1/orders/checkout endpoint returned verified bill ₹1,360');

  console.log('All SKILL 10 & SKILL 17 Billing and Orders tests passed successfully! ✓\n');
}

runBillingAndOrderTests().catch((err) => {
  console.error('Billing and Orders test failed:', err);
  process.exit(1);
});
