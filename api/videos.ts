import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check for environment variables
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('Missing Vercel KV environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing database credentials.' });
  }

  try {
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    const videoIds = await kv.zrange('videos:chronological', 0, -1, { rev: true });

    if (!videoIds || videoIds.length === 0) {
      return res.status(200).json([]);
    }

    const pipeline = kv.pipeline();
    videoIds.forEach(id => {
      if (id) { // Ensure id is not null/undefined
          pipeline.hgetall(`video:${id}`);
      }
    });
    const results = await pipeline.exec();

    // Filter out any null results which can happen if a video hash is missing
    const validResults = results.filter(result => result !== null);

    res.status(200).json(validResults);
  } catch (error: any) {
    console.error('Error in /api/videos:', error);
    res.status(500).json({
        error: 'Failed to fetch videos from the database.',
        details: error.message
    });
  }
}
