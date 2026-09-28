import { PrismaClient } from '@prisma/client';

const DEFAULT_SUPABASE_URL = "postgresql://postgres.yqciwlvmoboszvxzodrl:multibusinessbillingsoftware@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
process.env.DATABASE_URL = process.env.DATABASE_URL || DEFAULT_SUPABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default async function handler(req: any, res: any) {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      take: 20
    });
    return res.status(200).json({ success: true, count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      envUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    });
  }
}
