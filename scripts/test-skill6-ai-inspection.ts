import assert from 'assert';
import sharp from 'sharp';

async function runAiInspectionTests() {
  console.log('--- Testing SKILL 6: AI Image Inspection ---');

  const endpoint = 'http://localhost:3000/api/v1/ai/inspect-craft';

  // 1. Test Terracotta Craft Image
  const terracottaBuf = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 180, g: 90, b: 60 }
    }
  }).jpeg().toBuffer();

  const resTerracotta = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/jpeg;base64,${terracottaBuf.toString('base64')}`,
      categoryHint: 'Pottery'
    })
  });

  assert.strictEqual(resTerracotta.status, 200, 'Craft inspection should succeed');
  const dataTerra = await resTerracotta.json();
  assert.strictEqual(dataTerra.success, true);
  assert.ok(dataTerra.data, 'Must return structured craft data');
  assert.ok(dataTerra.data.product_name, 'Must have product_name');
  assert.ok(dataTerra.data.category, 'Must have category / craft type');
  assert.ok(dataTerra.data.colour, 'Must have detected colour');
  assert.ok(dataTerra.confidence <= 0.95, 'Must NEVER claim 100% accuracy (confidence <= 0.95)');
  console.log('✓ Test 1 Passed: Terracotta inspection returned:', {
    name: dataTerra.data.product_name,
    category: dataTerra.data.category,
    colour: dataTerra.data.colour,
    confidence: dataTerra.confidence
  });

  // 2. Test Silk Handloom Craft Image (Crimson & Gold tones)
  const silkBuf = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 3,
      background: { r: 140, g: 30, b: 50 }
    }
  }).jpeg().toBuffer();

  const resSilk = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/jpeg;base64,${silkBuf.toString('base64')}`,
      categoryHint: 'Handloom'
    })
  });
  const dataSilk = await resSilk.json();
  assert.strictEqual(dataSilk.success, true);
  assert.ok(dataSilk.data.product_name.length > 0);
  assert.ok(dataSilk.confidence <= 0.95);
  console.log('✓ Test 2 Passed: Silk Handloom inspection returned:', {
    name: dataSilk.data.product_name,
    category: dataSilk.data.category,
    colour: dataSilk.data.colour
  });

  // 3. Test Pure Black / Unreadable Photo Fallback
  const blackBuf = await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: { r: 5, g: 5, b: 5 }
    }
  }).jpeg().toBuffer();

  const resBlack = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: `data:image/jpeg;base64,${blackBuf.toString('base64')}`
    })
  });
  const dataBlack = await resBlack.json();
  assert.strictEqual(dataBlack.success, false, 'Unreadable photo should trigger graceful fallback');
  assert.strictEqual(dataBlack.error, 'could_not_read_photo');
  assert.ok(dataBlack.message.includes('voice instead'), 'Fallback message should invite voice input');
  console.log('✓ Test 3 Passed: Dark/unreadable photo fallback verified with friendly message:', dataBlack.message);

  console.log('All SKILL 6 AI Image Inspection tests passed successfully! ✓\n');
}

runAiInspectionTests().catch((err) => {
  console.error('AI Inspection test failed:', err);
  process.exit(1);
});
