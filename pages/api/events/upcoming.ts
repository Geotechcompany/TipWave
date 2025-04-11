import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events = await getCollection('events');
    
    const upcomingEvents = await events
      .find({ status: 'ACTIVE' })
      .sort({ startDate: 1 })
      .limit(5)
      .toArray();

    return res.status(200).json(upcomingEvents);
  } catch (error) {
    console.error('Error in /api/events/upcoming:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 