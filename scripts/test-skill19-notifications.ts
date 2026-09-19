import assert from 'assert';
import { notificationService, InAppNotificationAdapter, EmailNotificationAdapter, SmsNotificationAdapter, WhatsAppNotificationAdapter } from '../server/services/notification.service.js';

async function runNotificationTests() {
  console.log('--- Testing SKILL 19: Notifications Service & Channel Adapters ---');

  // 1. In-App Notification Adapter Test
  const inAppAdapter = new InAppNotificationAdapter();
  const inAppRes = await inAppAdapter.send({
    userId: 'usr-art-01',
    title: 'New Order Received',
    body: 'Lakshmi Devi ordered 1x Pochampally Saree',
    channel: 'in_app',
    type: 'order'
  });
  assert.strictEqual(inAppRes.success, true);
  assert.strictEqual(inAppRes.channel, 'in_app');
  assert.ok(inAppRes.messageId);
  console.log('✓ SKILL 19: In-App notification adapter dispatches notification record');

  // 2. Email Adapter Test
  const emailAdapter = new EmailNotificationAdapter();
  const emailRes = await emailAdapter.send({
    recipientEmail: 'buyer@crafts.in',
    title: 'Order Confirmed #1234',
    body: 'Your handmade craft order is confirmed',
    channel: 'email',
    type: 'order'
  });
  assert.strictEqual(emailRes.success, true);
  assert.strictEqual(emailRes.channel, 'email');
  assert.ok(emailRes.status === 'delivered' || emailRes.status === 'demo_simulated');
  console.log(`✓ SKILL 19: Email adapter cleanly operates (status: ${emailRes.status})`);

  // 3. SMS Adapter Test
  const smsAdapter = new SmsNotificationAdapter();
  const smsRes = await smsAdapter.send({
    recipientPhone: '+91 98480 12345',
    title: 'KALAtech Verification Code',
    body: 'Your OTP is 8421',
    channel: 'sms',
    type: 'system'
  });
  assert.strictEqual(smsRes.success, true);
  assert.strictEqual(smsRes.channel, 'sms');
  console.log(`✓ SKILL 19: SMS adapter cleanly operates (status: ${smsRes.status})`);

  // 4. WhatsApp Adapter Test
  const waAdapter = new WhatsAppNotificationAdapter();
  const waRes = await waAdapter.send({
    recipientPhone: '+91 98480 12345',
    title: 'Order Notification',
    body: 'New order arrived',
    channel: 'whatsapp',
    type: 'order',
    metadata: { orderId: 'ord-8812', productName: 'Ikat Saree', totalAmount: 4750, buyerName: 'Ananya' }
  });
  assert.strictEqual(waRes.success, true);
  assert.strictEqual(waRes.channel, 'whatsapp');
  console.log(`✓ SKILL 19: WhatsApp adapter cleanly operates (status: ${waRes.status})`);

  // 5. Unified NotificationService Multi-Dispatch Test
  const dispatchResults = await notificationService.notifyArtisanOfOrder({
    id: 'ord-test-99',
    product_title: 'Terracotta Hand-carved Lamp',
    quantity: 2,
    total_amount: 3200,
    artisan_id: 'usr-art-01',
    artisan_phone: '+91 98480 12345',
    buyer_name: 'Vikram Mehta'
  });

  assert.strictEqual(dispatchResults.length, 2, 'Should dispatch in-app and WhatsApp notifications');
  assert.ok(dispatchResults.every(r => r.success), 'All dispatches must succeed gracefully');
  console.log('✓ SKILL 19: Unified NotificationService successfully coordinated multi-channel delivery');

  console.log('--- ALL SKILL 19 TESTS PASSED SUCCESSFULLY! ---');
}

runNotificationTests().catch(err => {
  console.error('Notification tests failed:', err);
  process.exit(1);
});
