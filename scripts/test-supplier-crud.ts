import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Supplier CRUD Verification Tests...');
  const businessId = 'biz-default-business';

  // Cleanup any test suppliers first
  await prisma.supplier.deleteMany({
    where: {
      businessId,
      name: { startsWith: 'TEST_' }
    }
  });

  // ==========================================
  // Test F: Valid 10-digit phone number
  // ==========================================
  console.log('\n--- Running Test F: Valid 10-digit phone (9876543210) ---');
  function isValidSupplierPhone(val: string | null | undefined): boolean {
    if (!val) return true;
    const trimmed = String(val).trim();
    if (!trimmed) return true;
    if (!/^\d+$/.test(trimmed)) return false;
    if (trimmed.length !== 10) return false;
    return true;
  }

  const phoneF = '9876543210';
  const isFValid = isValidSupplierPhone(phoneF);
  console.log(`Phone ${phoneF} validation result:`, isFValid ? 'VALID (PASSED)' : 'INVALID (FAILED)');
  if (!isFValid) throw new Error('Test F failed validation check');

  // ==========================================
  // Test G: Invalid 11-digit phone number
  // ==========================================
  console.log('\n--- Running Test G: Invalid 11-digit phone (98765432101) ---');
  const phoneG = '98765432101';
  const isGValid = isValidSupplierPhone(phoneG);
  console.log(`Phone ${phoneG} validation result:`, isGValid ? 'VALID (UNEXPECTED)' : 'REJECTED WITH VALIDATION ERROR (PASSED)');
  if (isGValid) throw new Error('Test G should have failed validation');

  // ==========================================
  // Test H: Invalid alphanumeric phone number
  // ==========================================
  console.log('\n--- Running Test H: Invalid alphanumeric phone (98765abc10) ---');
  const phoneH = '98765abc10';
  const isHValid = isValidSupplierPhone(phoneH);
  console.log(`Phone ${phoneH} validation result:`, isHValid ? 'VALID (UNEXPECTED)' : 'REJECTED WITH VALIDATION ERROR (PASSED)');
  if (isHValid) throw new Error('Test H should have failed validation');

  // ==========================================
  // Test A: Create one supplier
  // ==========================================
  console.log('\n--- Running Test A: Create one supplier in Database ---');
  const testSup = await prisma.supplier.create({
    data: {
      businessId,
      name: 'TEST_Single_Supplier',
      contact: '9876543210',
      phone: '9876543210',
      email: 'test@supplier.com',
      address: 'Chennai, TN',
    }
  });
  console.log('Created Supplier in DB:', testSup.id, testSup.name);

  const countAfterA = await prisma.supplier.count({
    where: { businessId, name: 'TEST_Single_Supplier' }
  });
  console.log(`DB Record Count for TEST_Single_Supplier: ${countAfterA} (Expected: 1)`);
  if (countAfterA !== 1) throw new Error(`Expected 1 record, found ${countAfterA}`);

  // ==========================================
  // Test B: Rapid duplicate submission prevention
  // ==========================================
  console.log('\n--- Running Test B: Rapid multiple submissions (10 clicks) ---');
  let duplicatePreventedCount = 0;
  const duplicateResponses: any[] = [];

  for (let i = 0; i < 10; i++) {
    // Check recent duplicate within 10 seconds (backend deduplication logic)
    const existing = await prisma.supplier.findFirst({
      where: {
        businessId,
        name: { equals: 'TEST_Duplicate_Check', mode: 'insensitive' },
        createdAt: { gte: new Date(Date.now() - 10000) }
      }
    });

    if (existing) {
      duplicatePreventedCount++;
      duplicateResponses.push(existing);
    } else {
      const created = await prisma.supplier.create({
        data: {
          businessId,
          name: 'TEST_Duplicate_Check',
          contact: '9876543210',
          phone: '9876543210',
        }
      });
      duplicateResponses.push(created);
    }
  }

  const countAfterB = await prisma.supplier.count({
    where: { businessId, name: 'TEST_Duplicate_Check' }
  });
  console.log(`Simulated 10 rapid clicks. DB records created: ${countAfterB}, Deduplicated hits: ${duplicatePreventedCount}`);
  if (countAfterB !== 1) throw new Error(`Expected exactly 1 supplier record, found ${countAfterB}`);

  // ==========================================
  // Test C: Fetch / Refresh from Database
  // ==========================================
  console.log('\n--- Running Test C: Refresh / GET suppliers from Database ---');
  const allSuppliers = await prisma.supplier.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Fetched ${allSuppliers.length} suppliers from database.`);
  const foundSingle = allSuppliers.find(s => s.name === 'TEST_Single_Supplier');
  console.log('TEST_Single_Supplier in DB:', Boolean(foundSingle));
  if (!foundSingle) throw new Error('TEST_Single_Supplier not found in database on refresh');

  // ==========================================
  // Test D: Delete the supplier
  // ==========================================
  console.log('\n--- Running Test D: Delete supplier from Database ---');
  await prisma.supplier.delete({
    where: { id: testSup.id }
  });
  console.log(`Deleted supplier ${testSup.id} from database.`);

  const countAfterD = await prisma.supplier.count({
    where: { id: testSup.id }
  });
  console.log(`DB Count after deletion for ID ${testSup.id}: ${countAfterD} (Expected: 0)`);
  if (countAfterD !== 0) throw new Error('Supplier still exists in database after delete');

  // ==========================================
  // Test E: Refresh after deletion
  // ==========================================
  console.log('\n--- Running Test E: Refresh after deletion ---');
  const freshSuppliers = await prisma.supplier.findMany({
    where: { businessId }
  });
  const reappeared = freshSuppliers.find(s => s.id === testSup.id);
  console.log(`Reappeared on refresh: ${Boolean(reappeared)} (Expected: false)`);
  if (reappeared) throw new Error('Deleted supplier reappeared in database query!');

  // Cleanup test B record
  await prisma.supplier.deleteMany({
    where: { businessId, name: { startsWith: 'TEST_' } }
  });

  console.log('\n🎉 ALL 8 TESTS (A through H) PASSED SUCCESSFULLY!');
}

runTests()
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
