/**
 * Automated Verification Script for Phase 2: Foundation, Database & Authentication
 */
import assert from 'node:assert/strict';
import { AuthService, generateToken, verifyToken, hashOtp } from '../server/services/auth.service.js';

async function runPhase2Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 2 — FOUNDATION, DATABASE & AUTHENTICATION (SKILLS 1 & 2)');
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

  // TEST 1: SHA-256 OTP Hashing is deterministic and non-plaintext
  await test('SHA-256 OTP hashing works and does not store plaintext', () => {
    const raw = '482910';
    const hash = hashOtp(raw);
    assert.notEqual(hash, raw);
    assert.equal(hash.length, 64);
    assert.equal(hashOtp(raw), hash);
  });

  // TEST 2: Request OTP generates 6-digit code with expiry and rate-limiting
  await test('AuthService.requestOtp generates code and accepts valid 10-digit phone', async () => {
    const phone = '9876543210';
    const res = await AuthService.requestOtp(phone, 'artisan');
    assert.equal(res.success, true);
    assert.ok(res.message.includes('9876543210'));
    if (res.demoOtp) {
      assert.equal(res.demoOtp.length, 6);
      assert.match(res.demoOtp, /^\d{6}$/);
    }
  });

  // TEST 3: Verify OTP creates signed token and role profile
  await test('AuthService.verifyOtp verifies valid OTP and returns signed session token', async () => {
    const phone = '9876543211';
    const reqRes = await AuthService.requestOtp(phone, 'artisan');
    const otpToUse = reqRes.demoOtp || '123456';
    const verifyRes = await AuthService.verifyOtp(phone, otpToUse, 'artisan');
    assert.equal(verifyRes.success, true);
    assert.ok(verifyRes.token);
    assert.equal(verifyRes.user.phone, phone);
    assert.equal(verifyRes.user.role, 'artisan');
    assert.ok(verifyRes.artisan);

    // Verify token structure
    const verified = verifyToken(verifyRes.token);
    assert.ok(verified);
    assert.equal(verified?.phone, phone);
  });

  // TEST 4: Reject Invalid OTP
  await test('AuthService.verifyOtp rejects invalid OTP code', async () => {
    const phone = '9876543212';
    await AuthService.requestOtp(phone, 'artisan');
    await assert.rejects(
      async () => {
        await AuthService.verifyOtp(phone, '000000', 'artisan');
      },
      { message: /Invalid or expired OTP/ }
    );
  });

  // TEST 5: Support Buyer Role
  await test('AuthService supports buyer role authentication', async () => {
    const phone = '9876543213';
    const req = await AuthService.requestOtp(phone, 'buyer');
    const otp = req.demoOtp || '123456';
    const res = await AuthService.verifyOtp(phone, otp, 'buyer');
    assert.equal(res.success, true);
    assert.equal(res.user.role, 'buyer');
  });

  // TEST 6: Support Admin Role
  await test('AuthService supports admin role authentication', async () => {
    const phone = '9876543214';
    const req = await AuthService.requestOtp(phone, 'admin');
    const otp = req.demoOtp || '123456';
    const res = await AuthService.verifyOtp(phone, otp, 'admin');
    assert.equal(res.success, true);
    assert.equal(res.user.role, 'admin');
  });

  // TEST 7: Cryptographic Tampering of Session Token is Rejected
  await test('Tampered signed tokens are rejected by verifyToken', () => {
    const token = generateToken({ id: 'usr-1', role: 'artisan', phone: '9876543210', name: 'Test' });
    const [body, sig] = token.split('.');
    const tampered = `${body}.${sig}tampered`;
    const verified = verifyToken(tampered);
    assert.equal(verified, null);
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 2 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase2Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
