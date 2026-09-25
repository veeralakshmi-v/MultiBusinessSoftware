import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllCredentials() {
  console.log('=== BUSINESSES ===');
  const businesses = await prisma.business.findMany({
    include: {
      users: true,
      employees: true,
    }
  });

  console.log(JSON.stringify(businesses, null, 2));
}

listAllCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
