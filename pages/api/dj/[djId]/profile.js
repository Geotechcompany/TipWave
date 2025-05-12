import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // GET request - fetch profile
    if (req.method === 'GET') {
      const profile = await db.collection('users').findOne(
        { _id: new ObjectId(djId) },
        { projection: { 
          displayName: 1, 
          bio: 1, 
          location: 1, 
          genres: 1,
          email: 1,
          image: 1
        }}
      );
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(200).json({ profile });
    }
    
    // PUT request - update profile
    if (req.method === 'PUT') {
      const { displayName, bio, location, genres } = req.body;
      
      const updateResult = await db.collection('users').updateOne(
        { _id: new ObjectId(djId) },
        { $set: { 
          displayName, 
          bio, 
          location, 
          genres: Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim()),
          updatedAt: new Date()
        }}
      );
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully' 
      });
    }
  } catch (error) {
    console.error('Error handling profile request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 