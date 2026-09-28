import app from '../server/index';

export default async function handler(req: any, res: any) {
  try {
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel serverless error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

