/**
 * Automated Verification Script for Phase 8: Billing, Checkout, Orders & Inventory (Skills 10 & 17)
 */
import assert from 'node:assert/strict';
import { db } from '../server/db.js';
import { OrderService } from '../server/services/order.service.js';

async function runPhase8Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 8 — BILLING, CHECKOUT, ORDERS & INVENTORY (SKILLS 10 & 17)');
  console.log('========================================================================\n');

  let total = 0;
  let passed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ TEST ${total} FAILED: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  // Get test product
  const product = db.products[0];
  assert.ok(product, 'Test product must exist');
  // Set known initial state
  const initialStock = 15;
  product.quantity = initialStock;
  product.artisanApprovedPrice = 4750;

  // TEST 1: Server-side Billing Calculation uses artisanApprovedPrice
  await test('Billing calculation uses artisanApprovedPrice and correct subtotal/tax/total formulas', () => {
    const bill = OrderService.calculateCheckoutBill({
      productId: product.id,
      quantity: 2,
    });

    assert.equal(bill.quantity, 2);
    assert.equal(bill.unitPrice, 4750);
    assert.equal(bill.subtotal, 4750 * 2); // 9500
    // Free shipping over 1500
    assert.equal(bill.shipping, 0);
    // 5% GST on 9500 = 475
    assert.equal(bill.tax, 475);
    assert.equal(bill.total, 9500 + 475); // 9975
  });

  // TEST 2: Rejection of Overselling (quantity > available stock)
  await test('OrderService rejects order if requested quantity exceeds available stock', () => {
    assert.throws(
      () => {
        OrderService.calculateCheckoutBill({
          productId: product.id,
          quantity: initialStock + 5, // 20 > 15
        });
      },
      { message: /exceeds available stock/ }
    );
  });

  // TEST 3: Authoritative Inventory Decrement upon Finalization
  await test('OrderService.finalizeOrder atomically decrements authoritative stock and persists order', async () => {
    const orderQty = 3;
    const res = await OrderService.finalizeOrder({
      productId: product.id,
      quantity: orderQty,
      buyerName: 'Pooja Sharma',
      buyerPhone: '+91 98765 43210',
      buyerAddress: 'Hyderabad, Telangana',
      paymentMethod: 'upi_direct',
      marketplaceSource: 'private_marketplace'
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    assert.equal(res.order.quantity, orderQty);
    assert.equal(res.order.unit_price, 4750);
    assert.equal(res.newStock, initialStock - orderQty); // 15 - 3 = 12
    assert.equal(product.quantity, initialStock - orderQty);
  });

  // TEST 4: Stock depletion marks status as sold_out
  await test('Depleting remaining stock updates status to sold_out and prevents further checkout', async () => {
    const remaining = product.quantity!;
    await OrderService.finalizeOrder({
      productId: product.id,
      quantity: remaining,
      buyerName: 'Final Buyer',
      buyerPhone: '+91 98765 00000',
    });

    assert.equal(product.quantity, 0);
    assert.equal(product.status, 'sold_out');

    // Attempting to buy now throws out of stock
    assert.throws(
      () => {
        OrderService.calculateCheckoutBill({
          productId: product.id,
          quantity: 1,
        });
      },
      { message: /out of stock/ }
    );
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 8 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase8Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
