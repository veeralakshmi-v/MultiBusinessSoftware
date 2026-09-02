import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_BUSINESS_ID = 'biz-default-business';

async function addKousalyaToSupabase() {
  console.log('⚡ Saving Employee "Kousalya" into Supabase PostgreSQL tables...');

  try {
    await prisma.$connect();

    // 1. Save to User table
    const user = await prisma.user.upsert({
      where: { username: '893924576' },
      update: { role: 'CASHIER', password: '1234' },
      create: {
        businessId: DEMO_BUSINESS_ID,
        username: '893924576',
        password: '1234',
        role: 'CASHIER',
      }
    });
    console.log('✅ User stored in Supabase User table:', user.username);

    // 2. Save to Employee table
    const employee = await prisma.employee.upsert({
      where: { employeeCode: 'EMP-893924576' },
      update: {
        fullName: 'Kousalya',
        phone: '893924576',
        aadharNumber: '46516165165',
        role: 'CASHIER',
        status: 'ACTIVE',
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        employeeCode: 'EMP-893924576',
        firstName: 'Kousalya',
        lastName: 'Staff',
        fullName: 'Kousalya',
        phone: '893924576',
        aadharNumber: '46516165165',
        role: 'CASHIER',
        status: 'ACTIVE',
      }
    });
    console.log('✅ Employee stored in Supabase Employee table:', employee.fullName, 'Code:', employee.employeeCode);

    console.log('\n📊 Current Supabase Counts:');
    console.log('User count:    ', await prisma.user.count());
    console.log('Employee count:', await prisma.employee.count());

  } catch (err: any) {
    console.error('❌ Error adding Kousalya:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addKousalyaToSupabase();
