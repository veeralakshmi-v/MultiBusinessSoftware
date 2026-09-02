import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFullDatabaseFlow() {
  console.log('🚀 Testing full database persistence flow...');
  const DEMO_BUSINESS_ID = 'biz-default-business';

  try {
    await prisma.$connect();

    // 1. Business
    const biz = await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: { name: 'Multi Business System' },
      create: { id: DEMO_BUSINESS_ID, name: 'Multi Business System', type: 'RETAIL' }
    });
    console.log('✅ Business upserted:', biz.name);

    // 2. Settings
    const settings = await prisma.businessProfileSettings.upsert({
      where: { businessId: DEMO_BUSINESS_ID },
      update: { businessName: 'Multi Business System', currencySymbol: '₹' },
      create: { businessId: DEMO_BUSINESS_ID, businessName: 'Multi Business System', currencySymbol: '₹' }
    });
    console.log('✅ Business settings saved:', settings.businessName);

    // 3. Category
    const category = await prisma.category.upsert({
      where: { name: 'Test Category' },
      update: {},
      create: { businessId: DEMO_BUSINESS_ID, name: 'Test Category', slug: 'test-category' }
    });
    console.log('✅ Category created:', category.name, category.id);

    // 4. Menu Item
    const menuItem = await prisma.menuItem.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        name: 'Test Product ' + Date.now().toString().slice(-4),
        categoryId: category.id,
        price: 150.0,
        gst: 5.0,
        isAvailable: true,
      }
    });
    console.log('✅ Menu item created:', menuItem.name, menuItem.id);

    // 5. Customer
    const customer = await prisma.customer.upsert({
      where: { mobile: '9998887776' },
      update: { name: 'Test Customer' },
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: 'Test Customer',
        mobile: '9998887776',
        email: 'testcustomer@example.com'
      }
    });
    console.log('✅ Customer created:', customer.name, customer.id);

    // 6. Order
    const order = await prisma.order.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        orderNumber: 'INV/TEST/' + Date.now().toString().slice(-4),
        status: 'COMPLETED',
        orderType: 'TAX_INVOICE',
        customerId: customer.id,
        subtotal: 150.0,
        tax: 7.5,
        total: 157.5,
        paymentMethod: 'CASH',
        items: {
          create: [{
            menuItemId: menuItem.id,
            quantity: 1,
            price: 150.0,
          }]
        }
      },
      include: { items: true, customer: true }
    });
    console.log('✅ Order created:', order.orderNumber, 'Total:', order.total);

    // 7. Raw Material
    const material = await prisma.rawMaterial.upsert({
      where: { name: 'Test Material' },
      update: { currentStock: 100 },
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: 'Test Material',
        unit: 'Kg',
        currentStock: 100,
        minStockLevel: 10,
        pricePerUnit: 50.0
      }
    });
    console.log('✅ Raw Material created:', material.name, material.currentStock, material.unit);

    // 8. Print database totals
    console.log('\n📊 Database Summary After Test:');
    console.log('Categories:', await prisma.category.count());
    console.log('MenuItems:', await prisma.menuItem.count());
    console.log('Customers:', await prisma.customer.count());
    console.log('Orders:', await prisma.order.count());
    console.log('Raw Materials:', await prisma.rawMaterial.count());
    console.log('Users:', await prisma.user.count());
  } catch (err) {
    console.error('❌ Database verification failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testFullDatabaseFlow();
