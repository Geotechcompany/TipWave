import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    const eventData = {
      ...req.body,
      djId: userId,
      createdAt: new Date(),
      status: 'upcoming'
    };

    const result = await db.collection('events').insertOne(eventData);

    res.status(201).json({ 
      success: true, 
      eventId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
} 