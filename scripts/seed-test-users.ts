import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestUsers() {
  console.log('Seeding standard test users and roles into Supabase PostgreSQL...');

  // 1. Default Universal Admin User
  const defaultBiz = await prisma.business.upsert({
    where: { id: 'biz-default-business' },
    update: { name: 'Multi-Store Retail & POS', type: 'RETAIL', isActive: true },
    create: { id: 'biz-default-business', name: 'Multi-Store Retail & POS', type: 'RETAIL', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: 'admin123', role: 'ADMIN', businessId: defaultBiz.id },
    create: { username: 'admin', password: 'admin123', role: 'ADMIN', businessId: defaultBiz.id }
  });

  // 2. Supermarket Tenant (VeeGo)
  const supermarketBiz = await prisma.business.upsert({
    where: { id: 'biz-veego-273' },
    update: { name: 'VeeGo Supermarket', type: 'SUPERMARKET', isActive: true },
    create: { id: 'biz-veego-273', name: 'VeeGo Supermarket', type: 'SUPERMARKET', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'kousi' },
    update: { password: 'kousi123', role: 'ADMIN', businessId: supermarketBiz.id },
    create: { username: 'kousi', password: 'kousi123', role: 'ADMIN', businessId: supermarketBiz.id }
  });

  await prisma.user.upsert({
    where: { username: 'cashier' },
    update: { password: '1234', role: 'CASHIER', businessId: supermarketBiz.id },
    create: { username: 'cashier', password: '1234', role: 'CASHIER', businessId: supermarketBiz.id }
  });

  // 3. Restaurant / Cafe Tenant
  const restaurantBiz = await prisma.business.upsert({
    where: { id: 'biz-royal-dine' },
    update: { name: 'Royal Dine Restaurant', type: 'RESTAURANT', isActive: true },
    create: { id: 'biz-royal-dine', name: 'Royal Dine Restaurant', type: 'RESTAURANT', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'restaurant_admin' },
    update: { password: 'admin123', role: 'ADMIN', businessId: restaurantBiz.id },
    create: { username: 'restaurant_admin', password: 'admin123', role: 'ADMIN', businessId: restaurantBiz.id }
  });

  await prisma.user.upsert({
    where: { username: 'chef_mario' },
    update: { password: '1234', role: 'KITCHEN_STAFF', businessId: restaurantBiz.id },
    create: { username: 'chef_mario', password: '1234', role: 'KITCHEN_STAFF', businessId: restaurantBiz.id }
  });

  // 4. Pharmacy / Medical Tenant
  const medicalBiz = await prisma.business.upsert({
    where: { id: 'biz-car-service-738' },
    update: { name: 'Apex Pharmacy & Healthcare', type: 'MEDICAL', isActive: true },
    create: { id: 'biz-car-service-738', name: 'Apex Pharmacy & Healthcare', type: 'MEDICAL', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'suriya' },
    update: { password: 'suriya123', role: 'ADMIN', businessId: medicalBiz.id },
    create: { username: 'suriya', password: 'suriya123', role: 'ADMIN', businessId: medicalBiz.id }
  });

  // 5. Garments / Apparel Tenant
  const garmentsBiz = await prisma.business.upsert({
    where: { id: 'biz-urban-trends' },
    update: { name: 'Urban Trends Fashion', type: 'GARMENTS', isActive: true },
    create: { id: 'biz-urban-trends', name: 'Urban Trends Fashion', type: 'GARMENTS', isActive: true }
  });

  await prisma.user.upsert({
    where: { username: 'fashion_admin' },
    update: { password: 'admin123', role: 'ADMIN', businessId: garmentsBiz.id },
    create: { username: 'fashion_admin', password: 'admin123', role: 'ADMIN', businessId: garmentsBiz.id }
  });

  // 6. Test Employees for Attendance & Employee Portal
  const empList = [
    {
      businessId: supermarketBiz.id,
      employeeCode: 'EMP-1001',
      firstName: 'Kharalya',
      lastName: 'Cashier',
      fullName: 'Kharalya Cashier',
      phone: '8939242577',
      role: 'CASHIER',
      email: 'kharalya@veego.com',
    },
    {
      businessId: supermarketBiz.id,
      employeeCode: 'EMP-1002',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      fullName: 'Ramesh Kumar (Staff)',
      phone: '9876500001',
      role: 'STAFF',
      email: 'ramesh@veego.com',
    },
    {
      businessId: restaurantBiz.id,
      employeeCode: 'EMP-2001',
      firstName: 'Mario',
      lastName: 'Chef',
      fullName: 'Mario Kitchen Lead',
      phone: '9876500002',
      role: 'KITCHEN_STAFF',
      email: 'mario@royaldine.com',
    },
    {
      businessId: medicalBiz.id,
      employeeCode: 'EMP-3001',
      firstName: 'Manoj',
      lastName: 'Staff',
      fullName: 'Manoj Pharmacist',
      phone: '8939242578',
      role: 'CASHIER',
      email: 'manoj@apexpharmacy.com',
    }
  ];

  for (const emp of empList) {
    const existing = await prisma.employee.findFirst({
      where: { employeeCode: emp.employeeCode }
    });
    if (!existing) {
      await prisma.employee.create({
        data: {
          businessId: emp.businessId,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          fullName: emp.fullName,
          phone: emp.phone,
          role: emp.role,
          email: emp.email,
          status: 'ACTIVE',
        }
      });
    }
  }

  console.log('✅ Standard test users and employees successfully seeded into Supabase database!');
}

seedTestUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
