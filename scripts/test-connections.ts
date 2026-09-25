import { PrismaClient } from '@prisma/client';

async function testConnection(urlName: string, databaseUrl: string) {
  console.log(`\n🔍 Testing connection to ${urlName}...`);
  console.log(`URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const client = new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  });

  try {
    await client.$connect();
    const count = await client.user.count();
    console.log(`✅ SUCCESS! Connected to ${urlName}. User count = ${count}`);

    const categories = await client.category.findMany();
    console.log(`✅ Category count = ${categories.length}`);
    console.log('Categories:', categories.map(c => c.name));

    const users = await client.user.findMany();
    console.log('Users in DB:', users.map(u => u.username));
  } catch (err: any) {
    console.error(`❌ FAILED connection to ${urlName}:`, err.message || err);
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  const url1 = "postgresql://postgres.yqciwlvmoboszvxzodrl:Kousalya%402252@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require";
  const url2 = "postgresql://postgres:Kousalya%402252@db.yqciwlvmoboszvxzodrl.supabase.co:5432/postgres?sslmode=require";
  const url3 = "postgresql://postgres.yqciwlvmoboszvxzodrl:Kousalya%402252@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";

  await testConnection("1. AWS Pooler Port 5432", url1);
  await testConnection("2. Direct DB Port 5432", url2);
  await testConnection("3. AWS Pooler Port 6543 (PgBouncer)", url3);
}

main();
