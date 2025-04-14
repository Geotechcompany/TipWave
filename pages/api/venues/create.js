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

    const venueData = {
      ...req.body,
      djId: userId,
      createdAt: new Date(),
      isFavorite: false,
      upcomingEvents: 0
    };

    const result = await db.collection('venues').insertOne(venueData);

    res.status(201).json({ 
      success: true, 
      venueId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
} 