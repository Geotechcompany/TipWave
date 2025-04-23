import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    try {
      const genres = await db.collection('song_requests')
        .aggregate([
          { $match: { djId: session.user.id } },
          { $group: { 
            _id: '$genre',
            count: { $sum: 1 }
          }},
          { $sort: { count: -1 } }
        ]).toArray();

      res.status(200).json(genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 