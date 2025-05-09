import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    const { filter = 'all' } = req.query;
    const client = await clientPromise;
    const db = client.db();

    let query = { djId: djId };
    if (filter === 'vip') {
      query.status = 'vip';
    } else if (filter === 'blocked') {
      query.status = 'blocked';
    }

    const [fans, stats] = await Promise.all([
      db.collection('fans')
        .find(query)
        .sort({ lastActive: -1 })
        .toArray(),
      db.collection('fans').aggregate([
        { $match: { djId: djId } },
        {
          $group: {
            _id: null,
            totalFans: { $sum: 1 },
            vipFans: {
              $sum: {
                $cond: [{ $eq: ['$status', 'vip'] }, 1, 0]
              }
            },
            activeToday: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$lastActive',
                      new Date(new Date().setHours(0, 0, 0, 0))
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray()
    ]);

    res.status(200).json({
      fans,
      stats: stats[0] || {
        totalFans: 0,
        vipFans: 0,
        activeToday: 0
      }
    });
  } catch (error) {
    console.error('Error fetching fans:', error);
    res.status(500).json({ error: 'Failed to fetch fans' });
  }
} 