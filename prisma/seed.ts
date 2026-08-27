/**
 * Multi-Business Billing System — Database Seed Script
 * Initializes clean business entity and admin user only.
 * No hardcoded dummy items, categories, or orders.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BUSINESS_ID = 'biz-default-business';

async function main() {
  console.log('🌱 Starting clean database initialization...\n');

  // 1. Default Business
  const business = await prisma.business.upsert({
    where: { id: BUSINESS_ID },
    update: {},
    create: {
      id: BUSINESS_ID,
      name: 'My Business',
      type: 'RETAIL',
      isActive: true,
    },
  });
  console.log(`✅ Business created: ${business.name} (${business.id})`);

  // 2. Business Profile Settings
  await prisma.businessProfileSettings.upsert({
    where: { businessId: BUSINESS_ID },
    update: {},
    create: {
      businessId: BUSINESS_ID,
      businessName: 'My Business',
      address: '124, Commercial Road, Chennai, Tamil Nadu - 600001',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone: '+91 98765 43210',
      email: 'contact@mybusiness.com',
      currencyCode: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
      invoicePrefix: 'INV/2026/',
      orderPrefix: 'ORD-',
      nextInvoiceNumber: 1001,
      gstin: '33AAAAA0000A1Z5',
      enableGst: true,
      taxSystemName: 'GST',
      taxCalculationMode: 'EXCLUSIVE',
      defaultPaperSize: '80MM',
      termsText: 'Goods once sold will not be taken back without original bill. Subject to local jurisdiction.',
      thankYouNote: 'Thank you for your business! Visit again soon 😊',
      activeTheme: 'DARK_GOLD',
    },
  });
  console.log('✅ Clean Business profile settings initialized');

  // 3. Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      businessId: BUSINESS_ID,
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user initialized: ${adminUser.username}`);

  console.log('\n✨ Database initialized with a clean slate (0 dummy items/categories).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
