import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHttpApiEndpoints() {
  console.log('🌐 Testing Express HTTP API endpoints on http://localhost:3001 ...');

  try {
    // 1. Post a new Category via HTTP
    const catRes = await fetch('http://localhost:3001/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Live Supabase Test Category' })
    });
    const catData = await catRes.json();
    console.log('1. POST /api/categories result:', catRes.status, catData);

    // 2. Post a new Menu Item via HTTP
    const itemRes = await fetch('http://localhost:3001/api/menu-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Live Supabase Test Item',
        categoryId: catData.id,
        price: 450,
        gst: 5,
        dietary: 'VEG'
      })
    });
    const itemData = await itemRes.json();
    console.log('2. POST /api/menu-items result:', itemRes.status, itemData);

    // 3. Post a new User/Staff via HTTP
    const userRes = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'live_staff_test',
        password: '123',
        role: 'CASHIER'
      })
    });
    const userData = await userRes.json();
    console.log('3. POST /api/users result:', userRes.status, userData);

    // 4. Post a new Order via HTTP
    const orderRes = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Live Test Customer',
        customerPhone: '9876543210',
        paymentMethod: 'CASH',
        subtotal: 450,
        tax: 22.5,
        discount: 0,
        total: 472.5,
        items: [
          {
            menuItemId: itemData.id,
            name: itemData.name,
            quantity: 1,
            price: 450,
            total: 450
          }
        ]
      })
    });
    const orderData = await orderRes.json();
    console.log('4. POST /api/orders result:', orderRes.status, orderData);

    console.log('\n🔍 Verifying rows in Supabase PostgreSQL directly...');
    await prisma.$connect();
    const createdCat = await prisma.category.findFirst({ where: { name: 'Live Supabase Test Category' } });
    console.log('Found Category in Supabase:', createdCat ? 'YES ✅' : 'NO ❌', createdCat?.id);

    const createdItem = await prisma.menuItem.findFirst({ where: { name: 'Live Supabase Test Item' } });
    console.log('Found MenuItem in Supabase:', createdItem ? 'YES ✅' : 'NO ❌', createdItem?.id);

    const createdUser = await prisma.user.findFirst({ where: { username: 'live_staff_test' } });
    console.log('Found User in Supabase:', createdUser ? 'YES ✅' : 'NO ❌', createdUser?.id);

    const createdOrder = await prisma.order.findFirst({ where: { id: orderData.id } });
    console.log('Found Order in Supabase:', createdOrder ? 'YES ✅' : 'NO ❌', createdOrder?.id);

  } catch (err: any) {
    console.error('❌ Error during HTTP API test:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

testHttpApiEndpoints();
