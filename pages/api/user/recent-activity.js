import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get recent song requests
    const recentRequests = await db.collection('requests')
      .find({ 
        userId: session.user.id 
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Get recent DJ interactions
    const recentDjInteractions = await db.collection('dj_interactions')
      .find({ 
        userId: session.user.id 
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Merge and sort all activities
    const allActivities = [
      ...recentRequests.map(req => ({
        type: 'request',
        timestamp: req.createdAt,
        details: req
      })),
      ...recentDjInteractions.map(interaction => ({
        type: 'interaction',
        timestamp: interaction.createdAt,
        details: interaction
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    res.status(200).json(allActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
} 