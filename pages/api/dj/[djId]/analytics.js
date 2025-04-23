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
      const { timeframe = 'week' } = req.query;
      const startDate = new Date();
      
      switch(timeframe) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default: // week
          startDate.setDate(startDate.getDate() - 7);
      }

      const analytics = await db.collection('song_requests')
        .aggregate([
          { 
            $match: { 
              djId: session.user.id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              totalEarnings: { $sum: '$amount' },
              completedRequests: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ]).toArray();

      res.status(200).json(analytics[0] || {
        totalRequests: 0,
        totalEarnings: 0,
        completedRequests: 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 