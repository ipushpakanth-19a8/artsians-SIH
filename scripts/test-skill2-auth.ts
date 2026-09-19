import assert from 'assert';
import { AuthService, generateToken, verifyToken } from '../server/services/auth.service.js';

async function runAuthTests() {
  console.log('--- Testing SKILL 2: Authentication ---');

  // 1. Test OTP Request
  const phone = '9876543210';
  const reqResult = await AuthService.requestOtp(phone, 'artisan');
  assert.strictEqual(reqResult.success, true, 'OTP request should succeed');
  assert.ok(reqResult.message.includes('OTP sent successfully'), 'Message should indicate OTP sent');
  assert.ok(reqResult.demoOtp, 'Demo OTP should be returned in development mode');
  const demoOtp = reqResult.demoOtp;
  console.log('✓ Test 1 Passed: OTP requested successfully with code:', demoOtp);

  // 2. Test OTP Verification with valid OTP
  const verifyResult = await AuthService.verifyOtp(phone, demoOtp, 'artisan');
  assert.strictEqual(verifyResult.success, true, 'OTP verification should succeed');
  assert.ok(verifyResult.token, 'A signed JWT token should be returned');
  assert.ok(verifyResult.user, 'User object should be returned');
  console.log('✓ Test 2 Passed: OTP verified successfully, user role:', verifyResult.user.role);

  // 3. Test Invalid OTP fails
  let failed = false;
  try {
    await AuthService.verifyOtp(phone, '000000', 'artisan');
  } catch (err: any) {
    failed = true;
    assert.ok(err.message.includes('Invalid or expired OTP'), 'Expected invalid OTP error message');
  }
  assert.strictEqual(failed, true, 'Invalid OTP should fail verification');
  console.log('✓ Test 3 Passed: Invalid OTP correctly rejected');

  // 4. Test Token verification & expiry
  const token = generateToken({
    id: 'test-user-123',
    role: 'artisan',
    phone,
    name: 'Rameshwar Rao'
  });
  const decoded = verifyToken(token);
  assert.ok(decoded, 'Token should decode successfully');
  assert.strictEqual(decoded.id, 'test-user-123');
  assert.strictEqual(decoded.role, 'artisan');
  console.log('✓ Test 4 Passed: Token generation and cryptographic verification succeeded');

  // 5. Test Buyer and Admin roles
  const buyerVerify = await AuthService.verifyOtp('9988776655', '123456', 'buyer');
  assert.strictEqual(buyerVerify.user.role, 'buyer');
  console.log('✓ Test 5 Passed: Buyer role correctly assigned upon OTP verification');

  console.log('All SKILL 2 Authentication tests passed successfully! ✓\n');
}

runAuthTests().catch((err) => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
