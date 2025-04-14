import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
            djId: userId,
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
            djId: userId,
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
            djId: userId,
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

function calculateTrend(data, period) {
  if (data.length < 2) return 0;
  const current = data[data.length - 1].total;
  const previous = data[data.length - 2].total;
  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
} 