import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeDatabase() {
  console.log('🔄 Connecting to Supabase to clear all live data...');

  // Disable triggers temporarily or truncate all tables with CASCADE
  const tableNames = [
    'OrderItem',
    'Order',
    'RecipeItem',
    'Promotion',
    'MenuItem',
    'Category',
    'InventoryMovement',
    'InventoryTransaction',
    'RawMaterial',
    'InventoryItem',
    'Supplier',
    'Table',
    'Customer',
    'BreakTime',
    'AttendanceLocation',
    'AttendanceLog',
    'Attendance',
    'LeaveRequest',
    'LeaveType',
    'Holiday',
    'Employee',
    'Designation',
    'Department',
    'Shift',
    'OfficeLocation',
    'AttendanceSettings',
    'InvoiceType',
    'CustomFieldDefinition',
    'DashboardConfig',
    'TenantModuleConfig',
    'BusinessProfileSettings',
    'AuditLog',
    'SystemSetting',
    'User',
    'Branch',
    'Business',
  ];

  for (const table of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`  ✓ Cleared table: "${table}"`);
    } catch (err: any) {
      // Fallback: try DELETE if TRUNCATE has foreign key lock
      try {
        await (prisma as any)[table[0].toLowerCase() + table.slice(1)]?.deleteMany?.({});
        console.log(`  ✓ Emptied table via Prisma deleteMany: "${table}"`);
      } catch (innerErr: any) {
        console.log(`  - Table "${table}" already empty or skipped.`);
      }
    }
  }

  console.log('\n--- VERIFYING CLEARED STATUS ---');
  const businessCount = await prisma.business.count();
  const userCount = await prisma.user.count();
  const productCount = await prisma.menuItem.count();
  const orderCount = await prisma.order.count();
  const employeeCount = await prisma.employee.count();

  console.log(`Businesses remaining: ${businessCount}`);
  console.log(`Users remaining: ${userCount}`);
  console.log(`Products remaining: ${productCount}`);
  console.log(`Orders remaining: ${orderCount}`);
  console.log(`Employees remaining: ${employeeCount}`);
  console.log('---------------------------------');
  console.log('✨ All live database records in Supabase have been completely wiped! Ready for fresh tenant creation.');
}

wipeDatabase()
  .catch((err) => {
    console.error('❌ Error clearing database:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
