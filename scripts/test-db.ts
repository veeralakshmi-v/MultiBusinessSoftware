import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_BUSINESS_ID = 'biz-default-business';

async function seedAndInspectSupabase() {
  console.log('⚡ Populating Supabase PostgreSQL tables...');

  try {
    await prisma.$connect();

    // 1. Business
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    // 2. Settings
    const settings = await prisma.businessProfileSettings.upsert({
      where: { businessId: DEMO_BUSINESS_ID },
      update: { businessName: 'My Business' },
      create: {
        businessId: DEMO_BUSINESS_ID,
        businessName: 'My Business',
        address: '124, Commercial Road, Chennai, TN - 600001',
        phone: '+91 98765 43210',
        email: 'contact@mybusiness.com',
        currencyCode: 'INR',
        currencySymbol: '₹',
        invoicePrefix: 'INV/2026/',
        orderPrefix: 'ORD-',
        nextInvoiceNumber: 1001,
        gstin: '33AAAAA0000A1Z5',
        enableGst: true,
        termsText: 'Goods once sold will not be taken back without original bill.',
        thankYouNote: 'Thank you for your business! Visit again soon 😊',
      }
    });
    console.log('✅ Settings:', settings.businessName);

    // 3. User
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: 'admin123' },
      create: {
        businessId: DEMO_BUSINESS_ID,
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
      }
    });
    console.log('✅ User:', user.username);

    // 4. Categories
    const defaultCats = ['General', 'Main Course', 'Beverages', 'Starters & Snacks', 'Desserts'];
    for (const catName of defaultCats) {
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { businessId: DEMO_BUSINESS_ID, name: catName, slug: catName.toLowerCase().replace(/\s+/g, '-') }
      });
    }
    console.log('✅ Default Categories seeded into Supabase!');

    // 5. Menu Items
    const mainCat = await prisma.category.findFirst({ where: { name: 'Main Course' } });
    const bevCat = await prisma.category.findFirst({ where: { name: 'Beverages' } });
    const starterCat = await prisma.category.findFirst({ where: { name: 'Starters & Snacks' } });
    const genCat = await prisma.category.findFirst({ where: { businessId: DEMO_BUSINESS_ID } });

    const defaultItems = [
      { name: 'Paneer Butter Masala', categoryId: mainCat?.id || genCat!.id, price: 220.0, gst: 5.0, dietary: 'VEG' },
      { name: 'Chicken Biryani', categoryId: mainCat?.id || genCat!.id, price: 280.0, gst: 5.0, dietary: 'NON_VEG' },
      { name: 'Masala Dosa', categoryId: starterCat?.id || genCat!.id, price: 90.0, gst: 5.0, dietary: 'VEG' },
      { name: 'Fresh Lime Soda', categoryId: bevCat?.id || genCat!.id, price: 50.0, gst: 5.0, dietary: 'VEG' },
    ];

    for (const item of defaultItems) {
      const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
      if (!existing) {
        await prisma.menuItem.create({
          data: {
            businessId: DEMO_BUSINESS_ID,
            name: item.name,
            categoryId: item.categoryId,
            price: item.price,
            gst: item.gst,
            dietary: item.dietary,
            isAvailable: true,
          }
        });
      }
    }
    console.log('✅ Default MenuItems seeded into Supabase!');

    // 6. Customer
    const customer = await prisma.customer.upsert({
      where: { mobile: '9999999999' },
      update: {},
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: 'Walk-in Customer',
        mobile: '9999999999',
      }
    });
    console.log('✅ Customer:', customer.name);

    console.log('\n📊 Current Supabase Database Record Counts:');
    console.log('-------------------------------------------');
    console.log('User count:             ', await prisma.user.count());
    console.log('Category count:         ', await prisma.category.count());
    console.log('MenuItem count:         ', await prisma.menuItem.count());
    console.log('Customer count:         ', await prisma.customer.count());
    console.log('BusinessSettings count: ', await prisma.businessProfileSettings.count());
    console.log('Order count:            ', await prisma.order.count());
    console.log('RawMaterial count:      ', await prisma.rawMaterial.count());
    console.log('-------------------------------------------');
  } catch (err) {
    console.error('❌ Supabase seeding error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAndInspectSupabase();
