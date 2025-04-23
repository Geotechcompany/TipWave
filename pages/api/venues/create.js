import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use NextAuth session instead of Clerk
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has DJ or Admin role
    if (session.user.role !== 'DJ' && 
        session.user.role !== 'BOTH' && 
        session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - DJ permissions required' });
    }

    const client = await clientPromise;
    const db = client.db();

    const venueData = {
      ...req.body,
      djId: session.user.id, // Use the user ID from NextAuth
      userId: session.user.id, // Keep track of creating user
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