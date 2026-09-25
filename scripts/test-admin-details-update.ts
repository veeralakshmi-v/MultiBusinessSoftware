import { PrismaClient } from '@prisma/client';
import assert from 'node:assert';

const prisma = new PrismaClient();
const DEMO_BUSINESS_ID = 'biz-default-business';

async function runAdminDetailsTests() {
  console.log('🧪 Starting Admin Details Update & Persistence Verification Tests...\n');

  try {
    // Ensure Business exists
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    // Clean or prepare Admin record in DB
    let adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        businessId: DEMO_BUSINESS_ID,
        password: 'admin123',
        role: 'ADMIN',
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
      }
    });

    await (prisma as any).employee.upsert({
      where: { employeeCode: 'EMP-admin' },
      update: {
        businessId: DEMO_BUSINESS_ID,
        fullName: 'Initial Admin Name',
        firstName: 'Initial',
        lastName: 'Admin',
        phone: '9876543210',
        email: 'initial.admin@mybusiness.com',
        address: '124 Commercial Road, Chennai',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        employeeCode: 'EMP-admin',
        fullName: 'Initial Admin Name',
        firstName: 'Initial',
        lastName: 'Admin',
        phone: '9876543210',
        email: 'initial.admin@mybusiness.com',
        address: '124 Commercial Road, Chennai',
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });

    console.log('--- Initial State Configured ---');
    console.log(`Admin User ID: ${adminUser.id}, Username: ${adminUser.username}\n`);

    // --- TEST 1: Update Admin Name ---
    console.log('--- Running Test 1: Update Admin Name ---');
    const newName = 'Kowsalya Administrator';
    await (prisma as any).employee.update({
      where: { employeeCode: 'EMP-admin' },
      data: { fullName: newName, firstName: 'Kowsalya', lastName: 'Administrator' }
    });
    // Fresh DB fetch
    const emp1 = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    assert.strictEqual(emp1.fullName, newName, 'Admin full name should match updated name in DB');
    console.log(`✅ Test 1 PASSED: Admin name successfully updated to "${emp1.fullName}" and persisted in DB.\n`);

    // --- TEST 2: Update Admin Phone ---
    console.log('--- Running Test 2: Update Admin Phone ---');
    const newPhone = '9876543299';
    await (prisma as any).employee.update({
      where: { employeeCode: 'EMP-admin' },
      data: { phone: newPhone }
    });
    await prisma.businessProfileSettings.upsert({
      where: { businessId: DEMO_BUSINESS_ID },
      update: { phone: newPhone },
      create: { businessId: DEMO_BUSINESS_ID, businessName: 'My Business', phone: newPhone }
    });
    const emp2 = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    const settings2 = await prisma.businessProfileSettings.findUnique({ where: { businessId: DEMO_BUSINESS_ID } });
    assert.strictEqual(emp2.phone, newPhone, 'Admin phone should match updated phone in DB');
    assert.strictEqual(settings2?.phone, newPhone, 'Business profile settings phone should match in DB');
    console.log(`✅ Test 2 PASSED: Admin phone updated to "${emp2.phone}" and persisted in DB.\n`);

    // --- TEST 3: Update Admin Email ---
    console.log('--- Running Test 3: Update Admin Email ---');
    const newEmail = 'kowsalya.admin@enterprise.in';
    await (prisma as any).employee.update({
      where: { employeeCode: 'EMP-admin' },
      data: { email: newEmail }
    });
    const emp3 = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    assert.strictEqual(emp3.email, newEmail, 'Admin email should match updated email in DB');
    console.log(`✅ Test 3 PASSED: Admin email updated to "${emp3.email}" and persisted in DB.\n`);

    // --- TEST 4: Multiple Fields Update Together ---
    console.log('--- Running Test 4: Update Multiple Fields (Name, Phone, Email, Address, PIN) ---');
    const multiUpdates = {
      fullName: 'Chief Executive Officer Admin',
      phone: '9876543288',
      email: 'ceo.admin@company.com',
      address: 'Suite 500, Tech Park, Chennai - 600096',
      password: 'new_secure_pin_1234',
    };
    await (prisma as any).employee.update({
      where: { employeeCode: 'EMP-admin' },
      data: {
        fullName: multiUpdates.fullName,
        phone: multiUpdates.phone,
        email: multiUpdates.email,
        address: multiUpdates.address,
      }
    });
    await prisma.user.update({
      where: { username: 'admin' },
      data: { password: multiUpdates.password }
    });
    const emp4 = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    const user4 = await prisma.user.findUnique({ where: { username: 'admin' } });
    assert.strictEqual(emp4.fullName, multiUpdates.fullName);
    assert.strictEqual(emp4.phone, multiUpdates.phone);
    assert.strictEqual(emp4.email, multiUpdates.email);
    assert.strictEqual(emp4.address, multiUpdates.address);
    assert.strictEqual(user4?.password, multiUpdates.password);
    console.log('✅ Test 4 PASSED: Multiple fields updated and verified together in DB.\n');

    // --- TEST 5: Existing Data Preservation (Change phone only, verify name & email remain) ---
    console.log('--- Running Test 5: Existing Data Preservation ---');
    const phoneOnlyUpdate = '9876543277';
    await (prisma as any).employee.update({
      where: { employeeCode: 'EMP-admin' },
      data: { phone: phoneOnlyUpdate }
    });
    const emp5 = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    assert.strictEqual(emp5.phone, phoneOnlyUpdate);
    assert.strictEqual(emp5.fullName, multiUpdates.fullName, 'Name must NOT be erased or reset');
    assert.strictEqual(emp5.email, multiUpdates.email, 'Email must NOT be erased or reset');
    assert.strictEqual(emp5.address, multiUpdates.address, 'Address must NOT be erased or reset');
    console.log('✅ Test 5 PASSED: Existing non-modified fields preserved without corruption.\n');

    // --- TEST 6: Fresh Database Read / Refresh Simulation ---
    console.log('--- Running Test 6: Fresh Read Simulation (Page Refresh / Relogin) ---');
    const freshRead = await (prisma as any).employee.findUnique({ where: { employeeCode: 'EMP-admin' } });
    assert.ok(freshRead, 'Record must exist on fresh read');
    assert.strictEqual(freshRead.fullName, multiUpdates.fullName);
    assert.strictEqual(freshRead.phone, phoneOnlyUpdate);
    assert.strictEqual(freshRead.email, multiUpdates.email);
    console.log('✅ Test 6 PASSED: Fresh database read returns exact persisted Admin record.\n');

    // --- TEST 7: Single Admin Record Integrity (No duplicates) ---
    console.log('--- Running Test 7: Verify Single Admin Record (No Duplicate Admins) ---');
    const adminCount = await prisma.user.count({
      where: { businessId: DEMO_BUSINESS_ID, role: 'ADMIN' }
    });
    assert.strictEqual(adminCount, 1, 'Only one primary Admin user should exist for the business');
    console.log(`✅ Test 7 PASSED: Exactly 1 Admin user record maintained (Count: ${adminCount}).\n`);

    console.log('🎉 ALL 7 ADMIN DETAILS UPDATE & PERSISTENCE TESTS PASSED 100%!');
  } finally {
    await prisma.$disconnect();
  }
}

runAdminDetailsTests();
