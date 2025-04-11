import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const djs = await getCollection('djs');
    
    const availableDjs = await djs
      .find({ status: 'ACTIVE' })
      .toArray();

    return res.status(200).json(availableDjs);
  } catch (error) {
    console.error('Error in /api/djs/available:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 