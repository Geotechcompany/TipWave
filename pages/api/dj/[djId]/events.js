import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { view = 'upcoming' } = req.query;
    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    let query = { djId: userId };

    // Add date filter based on view
    if (view === 'upcoming') {
      query.date = { $gte: now };
    } else if (view === 'past') {
      query.date = { $lt: now };
    }

    const events = await db.collection('events')
      .find(query)
      .sort({ date: view === 'past' ? -1 : 1 })
      .toArray();

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
} 