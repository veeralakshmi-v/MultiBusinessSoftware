import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres.yqciwlvmoboszvxzodrl',
  password: 'multibusinessbillingsoftware',
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  connectionTimeoutMillis: 5000,
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-business-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await pool.query(`SELECT * FROM "Category" ORDER BY name ASC`);
    return res.status(200).json(result.rows || []);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: err.message });
  }
}
