import assert from 'assert';

async function runProductCatalogTests() {
  console.log('--- Testing SKILL 7: Product Cataloging ---');

  const endpoint = 'http://localhost:3000/api/v1/products';

  // 1. Create a Product with Canonical Fields
  const newProductPayload = {
    title: 'Pochampally Handwoven Silk Saree',
    category: 'Handloom',
    material: 'Pure Mulberry Silk',
    colors: ['Royal Crimson', 'Gold Zari'],
    address: 'Pochampally, Telangana, India',
    quantity: 12,
    description: 'Authentic handwoven Pochampally silk saree crafted by master weavers.',
    price: 4750,
    final_price: 4750,
    artisan_id: 'art-01',
    artisan_name: 'Rameshwar Rao',
    artisan_district: 'Pochampally',
    artisan_state: 'Telangana',
    status: 'published'
  };

  const createRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProductPayload)
  });

  assert.strictEqual(createRes.status, 200, 'Product creation should succeed');
  const createdData = await createRes.json();
  const createdProd = createdData.product || createdData;
  assert.ok(createdProd.id, 'Product must have an ID');
  assert.strictEqual(createdProd.title, newProductPayload.title);
  assert.strictEqual(createdProd.category, 'Handloom');
  const productId = createdProd.id;
  console.log('✓ Test 1 Passed: Product created with canonical fields, ID:', productId);

  // 2. Fetch the created Product by ID
  const fetchRes = await fetch(`${endpoint}/${productId}`);
  assert.strictEqual(fetchRes.status, 200);
  const fetched = await fetchRes.json();
  assert.strictEqual(fetched.id, productId);
  assert.strictEqual(fetched.artisan_id, 'art-01');
  console.log('✓ Test 2 Passed: Fetched product by ID successfully');

  // 3. Update the Product (e.g. quantity or description)
  const patchRes = await fetch(`${endpoint}/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 15, final_price: 4800 })
  });
  assert.strictEqual(patchRes.status, 200);
  const patched = await patchRes.json();
  const updatedProd = patched.product || patched;
  assert.strictEqual(updatedProd.quantity, 15);
  console.log('✓ Test 3 Passed: Updated product quantity and price via PATCH');

  // 4. List Products with Category Filter
  const listRes = await fetch(`${endpoint}?category=Handloom`);
  assert.strictEqual(listRes.status, 200);
  const list = await listRes.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.length > 0, 'Should find products in Handloom category');
  console.log('✓ Test 4 Passed: Filtered products by category, count:', list.length);

  console.log('All SKILL 7 Product Cataloging tests passed successfully! ✓\n');
}

runProductCatalogTests().catch((err) => {
  console.error('Product Catalog test failed:', err);
  process.exit(1);
});
