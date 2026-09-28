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
    const result = await pool.query(`
      SELECT m.*, c.name as "categoryName" 
      FROM "MenuItem" m 
      LEFT JOIN "Category" c ON m."categoryId" = c.id 
      ORDER BY m."createdAt" DESC
    `);
    
    const items = result.rows.map(item => {
      let attrs: any = {};
      try {
        attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes || '{}') : (item.attributes || {});
      } catch {}

      return {
        ...item,
        costPrice: attrs.costPrice ?? 0,
        unit: attrs.unit || 'Pcs',
        currentStock: attrs.currentStock ?? 50,
        minStockLevel: attrs.minStockLevel ?? attrs.minStock ?? 10,
        minStock: attrs.minStock ?? attrs.minStockLevel ?? 10,
        sku: attrs.sku || '',
        barcode: attrs.barcode || '',
        supplierId: attrs.supplierId || '',
        supplierName: attrs.supplierName || '',
        description: attrs.description || '',
        showInWebsite: attrs.showInWebsite === true,
        category: item.categoryName ? { id: item.categoryId, name: item.categoryName } : { id: 'cat-general', name: 'General' },
        attributes: attrs,
      };
    });

    return res.status(200).json(items);
  } catch (err: any) {
    console.error('Error fetching menu items:', err);
    return res.status(500).json({ error: err.message });
  }
}
