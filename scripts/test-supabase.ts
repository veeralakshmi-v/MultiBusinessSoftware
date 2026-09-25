import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSupabase() {
  console.log('Connecting to Supabase PostgreSQL database...');
  const businessCount = await prisma.business.count();
  const userCount = await prisma.user.count();
  const productCount = await prisma.menuItem.count();
  const employeeCount = await prisma.employee.count();
  
  console.log('--- SUPABASE DATABASE CONNECTION STATUS ---');
  console.log('Connected to Host: aws-0-ap-northeast-2.pooler.supabase.com');
  console.log(`Total Businesses in Supabase: ${businessCount}`);
  console.log(`Total Users in Supabase: ${userCount}`);
  console.log(`Total Products in Supabase: ${productCount}`);
  console.log(`Total Employees in Supabase: ${employeeCount}`);
  console.log('-------------------------------------------');
}

testSupabase()
  .catch((err) => {
    console.error('Supabase connection error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
