import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Product Edit & GST Verification Tests...\n');
  const businessId = 'biz-default-business';

  // Ensure default category exists
  let defaultCat = await prisma.category.findFirst({ where: { businessId } });
  if (!defaultCat) {
    defaultCat = await prisma.category.create({
      data: { businessId, name: 'General', slug: 'general' }
    });
  }

  // Cleanup any old test items
  await prisma.menuItem.deleteMany({
    where: {
      businessId,
      name: { startsWith: 'TEST_' }
    }
  });

  // ==========================================================
  // Setup: Create Initial Test Product (Product A, Price 100, GST 5%)
  // ==========================================================
  console.log('--- Creating Initial Test Product (Product A) ---');
  const initialProduct = await prisma.menuItem.create({
    data: {
      businessId,
      name: 'TEST_Product_A',
      categoryId: defaultCat.id,
      price: 100.0,
      gst: 5.0,
      hsnCode: '2106',
      attributes: JSON.stringify({
        costPrice: 60.0,
        unit: 'Pcs',
        currentStock: 50,
        minStockLevel: 10,
        sku: 'SKU-A100',
        barcode: '123456789012',
      })
    }
  });
  console.log(`Created product: ID=${initialProduct.id}, Name=${initialProduct.name}, Price=${initialProduct.price}, GST=${initialProduct.gst}%\n`);

  // ==========================================================
  // Test 1 — Edit Product Name (Product A -> Product B)
  // ==========================================================
  console.log('--- Running Test 1: Edit Product Name (TEST_Product_A -> TEST_Product_B) ---');
  const updatedNameProduct = await prisma.menuItem.update({
    where: { id: initialProduct.id },
    data: { name: 'TEST_Product_B' }
  });
  console.log(`Updated name in DB: ID=${updatedNameProduct.id}, Name=${updatedNameProduct.name}`);

  // Query fresh from DB (simulate refresh)
  const fresh1 = await prisma.menuItem.findUnique({ where: { id: initialProduct.id } });
  if (!fresh1 || fresh1.name !== 'TEST_Product_B') {
    throw new Error(`Test 1 Failed: Expected name TEST_Product_B, got ${fresh1?.name}`);
  }
  console.log('✅ Test 1 PASSED: Product Name successfully updated and persisted on refresh.\n');

  // ==========================================================
  // Test 2 — Edit Selling Price
  // ==========================================================
  console.log('--- Running Test 2: Edit Selling Price (100 -> 249.99) ---');
  await prisma.menuItem.update({
    where: { id: initialProduct.id },
    data: { price: 249.99 }
  });

  // Query fresh from DB (simulate refresh)
  const fresh2 = await prisma.menuItem.findUnique({ where: { id: initialProduct.id } });
  if (!fresh2 || fresh2.price !== 249.99) {
    throw new Error(`Test 2 Failed: Expected price 249.99, got ${fresh2?.price}`);
  }
  console.log(`✅ Test 2 PASSED: Selling Price updated to ${fresh2.price} and persisted on refresh.\n`);

  // ==========================================================
  // Test 3 — Edit GST (5% -> 18%)
  // ==========================================================
  console.log('--- Running Test 3: Edit GST (5% -> 18%) ---');
  await prisma.menuItem.update({
    where: { id: initialProduct.id },
    data: { gst: 18.0 }
  });

  // Query fresh from DB (simulate refresh)
  const fresh3 = await prisma.menuItem.findUnique({ where: { id: initialProduct.id } });
  if (!fresh3 || fresh3.gst !== 18.0) {
    throw new Error(`Test 3 Failed: Expected GST 18%, got ${fresh3?.gst}%`);
  }
  console.log(`✅ Test 3 PASSED: GST updated to ${fresh3.gst}% and persisted in DB on refresh.\n`);

  // ==========================================================
  // Test 4 — Edit GST Again (18% -> 12%)
  // ==========================================================
  console.log('--- Running Test 4: Edit GST Again (18% -> 12%) ---');
  await prisma.menuItem.update({
    where: { id: initialProduct.id },
    data: { gst: 12.0 }
  });

  // Query fresh from DB (simulate refresh)
  const fresh4 = await prisma.menuItem.findUnique({ where: { id: initialProduct.id } });
  if (!fresh4 || fresh4.gst !== 12.0) {
    throw new Error(`Test 4 Failed: Expected GST 12%, got ${fresh4?.gst}%`);
  }
  console.log(`✅ Test 4 PASSED: GST updated to ${fresh4.gst}% and persisted in DB on refresh.\n`);

  // ==========================================================
  // Test 5 — Multiple Products with Different GST Values (5%, 12%, 18%, 28%)
  // ==========================================================
  console.log('--- Running Test 5: Multiple Products with Distinct GST Values ---');
  const prod1 = await prisma.menuItem.create({
    data: { businessId, name: 'TEST_Prod_5pct', categoryId: defaultCat.id, price: 50, gst: 5.0 }
  });
  const prod2 = await prisma.menuItem.create({
    data: { businessId, name: 'TEST_Prod_12pct', categoryId: defaultCat.id, price: 120, gst: 12.0 }
  });
  const prod3 = await prisma.menuItem.create({
    data: { businessId, name: 'TEST_Prod_18pct', categoryId: defaultCat.id, price: 180, gst: 18.0 }
  });
  const prod4 = await prisma.menuItem.create({
    data: { businessId, name: 'TEST_Prod_28pct', categoryId: defaultCat.id, price: 280, gst: 28.0 }
  });

  const queryProds = await prisma.menuItem.findMany({
    where: {
      id: { in: [prod1.id, prod2.id, prod3.id, prod4.id] }
    }
  });

  const mapGst = new Map(queryProds.map(p => [p.name, p.gst]));
  console.log('Product 1 GST:', mapGst.get('TEST_Prod_5pct'), '(Expected: 5)');
  console.log('Product 2 GST:', mapGst.get('TEST_Prod_12pct'), '(Expected: 12)');
  console.log('Product 3 GST:', mapGst.get('TEST_Prod_18pct'), '(Expected: 18)');
  console.log('Product 4 GST:', mapGst.get('TEST_Prod_28pct'), '(Expected: 28)');

  if (
    mapGst.get('TEST_Prod_5pct') !== 5.0 ||
    mapGst.get('TEST_Prod_12pct') !== 12.0 ||
    mapGst.get('TEST_Prod_18pct') !== 18.0 ||
    mapGst.get('TEST_Prod_28pct') !== 28.0
  ) {
    throw new Error('Test 5 Failed: GST values not independently preserved!');
  }
  console.log('✅ Test 5 PASSED: Distinct GST rates (5%, 12%, 18%, 28%) preserved across multiple products.\n');

  // ==========================================================
  // Test 6 — Confirming Edit Does Not Create Duplicate Products
  // ==========================================================
  console.log('--- Running Test 6: Verify Edit preserves exact same ID and creates no duplicates ---');
  const countBefore = await prisma.menuItem.count({ where: { businessId } });
  
  // Update prod3
  const updatedProd3 = await prisma.menuItem.update({
    where: { id: prod3.id },
    data: { name: 'TEST_Prod_18pct_Renamed', price: 195.0, gst: 18.0 }
  });

  const countAfter = await prisma.menuItem.count({ where: { businessId } });
  console.log(`Total Products Before Edit: ${countBefore}, After Edit: ${countAfter} (Expected Difference: 0)`);
  console.log(`Original ID: ${prod3.id}, Updated ID: ${updatedProd3.id}`);

  if (countBefore !== countAfter || prod3.id !== updatedProd3.id) {
    throw new Error('Test 6 Failed: Editing created duplicate records or changed product ID!');
  }
  console.log('✅ Test 6 PASSED: Editing strictly updated existing row without creating duplicates.\n');

  // Cleanup test records
  await prisma.menuItem.deleteMany({
    where: {
      businessId,
      name: { startsWith: 'TEST_' }
    }
  });

  console.log('🎉 ALL 6 PRODUCT & GST TESTS (Test 1 through Test 6) PASSED 100%!');
}

runTests()
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
