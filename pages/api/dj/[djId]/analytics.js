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

    // Get analytics data
    const [popularSongs, audienceStats, revenueData] = await Promise.all([
      // Popular songs
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
            _id: '$songId',
            requestCount: { $sum: 1 },
            totalRevenue: { $sum: '$amount' }
          }
        },
        {
          $lookup: {
            from: 'songs',
            localField: '_id',
            foreignField: '_id',
            as: 'song'
          }
        },
        { $unwind: '$song' },
        {
          $project: {
            _id: 1,
            title: '$song.title',
            requestCount: 1,
            totalRevenue: 1
          }
        },
        { $sort: { requestCount: -1 } },
        { $limit: 5 }
      ]).toArray(),

      // Audience stats
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
            _id: null,
            totalRequests: { $sum: 1 },
            uniqueRequesters: { $addToSet: '$userId' },
            totalRevenue: { $sum: '$amount' }
          }
        },
        {
          $project: {
            _id: 0,
            totalRequests: 1,
            uniqueRequesters: { $size: '$uniqueRequesters' },
            avgRequestValue: { $divide: ['$totalRevenue', '$totalRequests'] }
          }
        }
      ]).toArray(),

      // Revenue trends
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
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            amount: { $sum: '$amount' }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            amount: 1
          }
        },
        { $sort: { date: 1 } }
      ]).toArray()
    ]);

    res.status(200).json({
      popularSongs,
      audienceStats: audienceStats[0] || {
        totalRequests: 0,
        uniqueRequesters: 0,
        avgRequestValue: 0
      },
      revenueData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
} 