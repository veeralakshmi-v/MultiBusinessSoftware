import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      users: { select: { id: true, username: true, role: true, createdAt: true } },
      employees: { select: { id: true, fullName: true, phone: true, createdAt: true } },
      orders: { select: { id: true, orderNumber: true, total: true, createdAt: true } },
      customers: { select: { id: true, name: true, mobile: true, createdAt: true } },
      categories: { select: { id: true, name: true, createdAt: true } },
      menuItems: { select: { id: true, name: true, price: true, createdAt: true } }
    }
  });

  console.log('Total businesses in DB:', businesses.length);
  for (const b of businesses) {
    console.log(`\n--- Business: ${b.name} (${b.id}) [Created: ${b.createdAt.toISOString()}] ---`);
    console.log(`Users (${b.users.length}):`, b.users.map(u => `${u.username} (${u.role}) - ${u.createdAt.toISOString()}`));
    console.log(`Employees (${b.employees.length}):`, b.employees.map(e => `${e.fullName} (${e.phone}) - ${e.createdAt.toISOString()}`));
    console.log(`Orders (${b.orders.length}):`, b.orders.map(o => `${o.orderNumber} (₹${o.total}) - ${o.createdAt.toISOString()}`));
    console.log(`Customers (${b.customers.length}):`, b.customers.map(c => `${c.name} - ${c.createdAt.toISOString()}`));
    console.log(`Categories (${b.categories.length}):`, b.categories.map(c => c.name));
    console.log(`Items (${b.menuItems.length}):`, b.menuItems.map(i => `${i.name} (₹${i.price})`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
