/**
 * Automated Verification Script for Phase 6: Product Catalog & Voice Entry (Skills 7 & 8)
 */
import assert from 'node:assert/strict';
import { ProductCatalogService } from '../src/lib/productCatalogService.js';
import { parseQuantityTranscript } from '../src/lib/voiceParsingService.js';

async function runPhase6Tests() {
  console.log('========================================================================');
  console.log('TESTING: PHASE 6 — PRODUCT CATALOG & VOICE ENTRY (SKILLS 7 & 8)');
  console.log('========================================================================\n');

  let total = 0;
  let passed = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      console.log(`  ✓ TEST ${total}: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ✗ TEST ${total} FAILED: ${name}`);
      console.error(e);
      process.exit(1);
    }
  }

  // TEST 1: Canonical Product Validation: All 6 core fields required
  test('ProductCatalogService.validateProductInput requires all core canonical fields', () => {
    const valid = ProductCatalogService.validateProductInput({
      name: 'Pochampally Ikat Saree',
      type: 'Handloom',
      color: 'Royal Crimson, Gold Zari',
      address: 'Bhoodan Pochampally, Telangana, India',
      quantity: 5,
      description: 'Handwoven silk saree made on traditional pit loom.',
      price: 4750,
      artisanId: 'art-01',
      images: ['https://example.com/saree.jpg'],
    });
    assert.equal(valid.valid, true);
    assert.equal(valid.errors.length, 0);

    // Missing address
    const invalidAddress = ProductCatalogService.validateProductInput({
      name: 'Clay Pot',
      type: 'Pottery',
      color: 'Terracotta',
      address: '',
      quantity: 10,
      description: 'Clay pot',
      price: 350,
      artisanId: 'art-02',
      images: [],
    });
    assert.equal(invalidAddress.valid, false);
    assert.ok(invalidAddress.errors.some(e => e.includes('address')));

    // Non-positive quantity
    const invalidQty = ProductCatalogService.validateProductInput({
      name: 'Clay Pot',
      type: 'Pottery',
      color: 'Terracotta',
      address: 'Jaipur, Rajasthan',
      quantity: 0,
      description: 'Clay pot',
      price: 350,
      artisanId: 'art-02',
      images: [],
    });
    assert.equal(invalidQty.valid, false);
    assert.ok(invalidQty.errors.some(e => e.includes('Quantity')));
  });

  // TEST 2: Quantity Voice Input Extraction
  test('parseQuantityTranscript correctly extracts integer quantities from voice', () => {
    assert.equal(parseQuantityTranscript('5'), 5);
    assert.equal(parseQuantityTranscript('five items'), 5);
    assert.equal(parseQuantityTranscript('ten pieces'), 10);
    assert.equal(parseQuantityTranscript('twenty five'), 25);
    assert.equal(parseQuantityTranscript('పాతిక'), 25); // Telugu for 25
    assert.equal(parseQuantityTranscript('ఐదు'), 5); // Telugu for 5
    assert.equal(parseQuantityTranscript('पाँच'), 5); // Hindi for 5
    // Zero or negative are rejected
    assert.equal(parseQuantityTranscript('zero pieces'), null);
    assert.equal(parseQuantityTranscript('-5'), null);
  });

  // TEST 3: Truthful Description Generation (No AI Hallucinations)
  test('ProductCatalogService generates truthful description without unverified claims', () => {
    const desc = ProductCatalogService.generateTruthfulDescription({
      name: 'Channapatna Wooden Stacker',
      type: 'Woodcraft',
      color: 'Turmeric Yellow, Sindoor Red',
      address: 'Channapatna, Karnataka, India',
      quantity: 12,
      material: 'Ivory Wood'
    }, 'en');

    assert.ok(desc.includes('Channapatna Wooden Stacker'));
    assert.ok(desc.includes('Woodcraft'));
    assert.ok(desc.includes('Turmeric Yellow, Sindoor Red'));
    assert.ok(desc.includes('Channapatna, Karnataka, India'));
    assert.ok(desc.includes('Ivory Wood'));
    assert.ok(desc.includes('12 pieces'));

    // Critical safety check: does not invent unconfirmed claims
    assert.ok(!desc.includes('GI certified'));
    assert.ok(!desc.includes('UNESCO'));
    assert.ok(!desc.includes('centuries-old secret'));
  });

  console.log('\n========================================================================');
  console.log(`ALL ${passed} / ${total} PHASE 6 TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

runPhase6Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
