import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (session.user.role !== 'DJ' && 
        session.user.role !== 'BOTH' && 
        session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - DJ permissions required' });
    }

    const client = await clientPromise;
    const db = client.db();

    const eventData = {
      ...req.body,
      djId: session.user.id,
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