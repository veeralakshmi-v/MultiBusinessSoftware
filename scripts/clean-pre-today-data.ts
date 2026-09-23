import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPreTodayData() {
  console.log('🧹 Cleaning pre-today data in Supabase PostgreSQL database...');
  
  // Start of today in UTC: 2026-09-23T00:00:00.000Z
  const startOfToday = new Date('2026-09-23T00:00:00.000Z');

  // 1. Delete older test businesses created before today
  const oldBusinesses = await prisma.business.findMany({
    where: {
      createdAt: { lt: startOfToday },
      id: { not: 'biz-default-business' }
    }
  });

  console.log(`Found ${oldBusinesses.length} old businesses to purge:`, oldBusinesses.map(b => `${b.name} (${b.id})`));

  for (const b of oldBusinesses) {
    // Cascade delete business
    try {
      await prisma.business.delete({ where: { id: b.id } });
      console.log(`✅ Deleted old business: ${b.name} (${b.id})`);
    } catch (err) {
      console.error(`Error deleting business ${b.id}:`, err);
    }
  }

  // 2. Clean any orphaned users/employees/orders created before today
  const deletedOldUsers = await prisma.user.deleteMany({
    where: {
      createdAt: { lt: startOfToday },
      username: { not: 'admin' }
    }
  });
  console.log(`Deleted ${deletedOldUsers.count} old users created before today.`);

  const deletedOldEmployees = await prisma.employee.deleteMany({
    where: {
      createdAt: { lt: startOfToday }
    }
  });
  console.log(`Deleted ${deletedOldEmployees.count} old employees created before today.`);

  const deletedOldOrders = await prisma.order.deleteMany({
    where: {
      createdAt: { lt: startOfToday }
    }
  });
  console.log(`Deleted ${deletedOldOrders.count} old orders created before today.`);

  // 3. Ensure biz-default-business is updated to today and admin / admin123 is present
  const defaultBiz = await prisma.business.upsert({
    where: { id: 'biz-default-business' },
    update: { name: 'Multi-Store Retail & POS', type: 'RETAIL', isActive: true, updatedAt: new Date() },
    create: { id: 'biz-default-business', name: 'Multi-Store Retail & POS', type: 'RETAIL', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: 'admin123', role: 'ADMIN', businessId: defaultBiz.id, updatedAt: new Date() },
    create: { username: 'admin', password: 'admin123', role: 'ADMIN', businessId: defaultBiz.id }
  });

  console.log('✅ Database cleanup complete! Remaining businesses & counts:');
  const remaining = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          employees: true,
          orders: true,
          categories: true,
          menuItems: true,
        }
      }
    }
  });

  console.log(JSON.stringify(remaining, null, 2));
}

cleanPreTodayData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
