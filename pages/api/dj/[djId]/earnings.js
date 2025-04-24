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

    const { timeframe = 'month' } = req.query;
    const client = await clientPromise;
    const db = client.db();

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now);
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const [totalEarnings, monthlyEarnings, recentTransactions] = await Promise.all([
      // Total earnings
      db.collection('requests').aggregate([
        { 
          $match: { 
            djId: djId,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),

      // Monthly earnings breakdown
      db.collection('requests').aggregate([
        {
          $match: {
            djId: djId,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]).toArray(),

      // Recent transactions
      db.collection('requests').aggregate([
        { 
          $match: { 
            djId: djId,
            status: 'completed'
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'songs',
            localField: 'songId',
            foreignField: '_id',
            as: 'song'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'requester'
          }
        },
        { $unwind: '$song' },
        { $unwind: '$requester' },
        {
          $project: {
            date: '$createdAt',
            amount: 1,
            songTitle: '$song.title',
            requesterName: '$requester.name'
          }
        }
      ]).toArray()
    ]);

    // Calculate trends
    const total = totalEarnings[0]?.total || 0;
    const monthly = monthlyEarnings.map(m => ({
      year: m._id.year,
      month: m._id.month,
      total: m.total
    }));

    res.status(200).json({
      total,
      monthly,
      recentTransactions,
      trends: {
        weekly: calculateTrend(monthly, 'week'),
        monthly: calculateTrend(monthly, 'month')
      }
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
}

// Add ESLint disable directive for the unused parameter
// eslint-disable-next-line no-unused-vars
function calculateTrend(data, period) {
  // Currently calculate a simple percentage change regardless of period
  // period parameter is kept for future implementation of different calculation methods
  if (data.length < 2) return 0;
  const current = data[data.length - 1].total;
  const previous = data[data.length - 2].total;
  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
} 