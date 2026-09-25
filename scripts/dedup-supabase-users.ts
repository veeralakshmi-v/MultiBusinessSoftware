import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateUsers() {
  console.log('Cleaning up duplicate phone user entries in Supabase...');

  // Delete phone users where username starts with + or contains digits only matching an employee's phone
  const allUsers = await prisma.user.findMany();
  const allEmployees = await prisma.employee.findMany();

  const phoneNumbers = new Set(allEmployees.map(e => e.phone).filter(Boolean));

  for (const user of allUsers) {
    if (user.username.startsWith('+') || user.username.startsWith('91') || phoneNumbers.has(user.username)) {
      // Check if there is another real username user for this business
      const realUser = allUsers.find(u => u.businessId === user.businessId && u.id !== user.id && !u.username.startsWith('+'));
      if (realUser) {
        console.log(`Deleting duplicate phone user account: "${user.username}" (real account: "${realUser.username}")`);
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
  }

  const remainingUsers = await prisma.user.findMany();
  console.log('Remaining clean users in Supabase:');
  console.table(remainingUsers.map(u => ({ id: u.id, username: u.username, role: u.role, businessId: u.businessId })));
}

cleanDuplicateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
