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
      const recentRequests = await db.collection('song_requests')
        .find({ djId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      res.status(200).json(recentRequests);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      res.status(500).json({ error: 'Failed to fetch recent requests' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 