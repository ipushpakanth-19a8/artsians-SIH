/**
 * Automated Verification Script for Phase 5: AI Vision & Gemini Craft Intelligence (Skill 6)
 */
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { VisionService } from '../server/services/vision.service.js';
import { inspectCraftImage } from '../server/services/craftInspection.service.js';

async function runPhase5Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 5 — AI VISION & GEMINI CRAFT INTELLIGENCE (SKILL 6)');
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

  // Generate test craft image (Terracotta clay pot buffer)
  const terracottaBuf = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 180, g: 90, b: 60 }
    }
  }).jpeg().toBuffer();
  const terracottaBase64 = `data:image/jpeg;base64,${terracottaBuf.toString('base64')}`;

  // TEST 1: VisionService feature extraction
  await test('VisionService extracts labels, objects, and dominant colors from image', async () => {
    const vision = await VisionService.extractVisualFeatures(terracottaBuf);
    assert.ok(vision);
    assert.ok(Array.isArray(vision.labels));
    assert.ok(vision.labels.length > 0);
    assert.ok(Array.isArray(vision.dominantColors));
    assert.ok(vision.dominantColors.length > 0);
    assert.equal(vision.dimensions.width, 400);
    assert.equal(vision.dimensions.height, 400);
  });

  // TEST 2: Structured Output Shape: { name, type, color, detectedDetails, confidence }
  await test('inspectCraftImage outputs structured { name, type, color, detectedDetails, confidence }', async () => {
    const res: any = await inspectCraftImage(terracottaBase64, 'en');
    assert.equal(res.success, true);
    assert.ok(res.name, 'name must be present');
    assert.ok(res.type, 'type must be present');
    assert.ok(res.color, 'color must be present');
    assert.ok(res.detectedDetails, 'detectedDetails must be present');
    assert.ok(res.detectedDetails.material !== undefined);
    assert.ok(res.detectedDetails.technique !== undefined);
    assert.ok(res.confidence > 0, 'confidence must be > 0');
    // Guard: never claim 100% accuracy
    assert.ok(res.confidence < 1.0, 'AI must never claim 100% confidence');
  });

  // TEST 3: Unreadable photo triggers safe error fallback
  await test('Unreadable/dark photo returns could_not_read_photo fallback', async () => {
    const darkBuf = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 5, g: 5, b: 5 }
      }
    }).jpeg().toBuffer();
    const darkBase64 = `data:image/jpeg;base64,${darkBuf.toString('base64')}`;

    const res = await inspectCraftImage(darkBase64, 'en');
    assert.equal(res.success, false);
    assert.equal(res.error, 'could_not_read_photo');
    assert.equal(res.message, "Couldn't read the photo, let's fill the details by voice instead");
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 5 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase5Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
