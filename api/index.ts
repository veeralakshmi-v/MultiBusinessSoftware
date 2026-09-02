import app from '../server/index';

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel API Serverless Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error', stack: err.stack });
  }
}
