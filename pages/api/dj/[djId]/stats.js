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

    const client = await clientPromise;
    const db = client.db();

    // Get dates for comparisons
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      currentRequests,
      lastWeekRequests,
      currentEarnings,
      lastMonthEarnings,
      totalRequests,
      completedRequests,
      upcomingEvents,
      topSongs
    ] = await Promise.all([
      // Current week requests
      db.collection('requests').countDocuments({
        djId: userId,
        createdAt: { $gte: lastWeek }
      }),

      // Previous week requests
      db.collection('requests').countDocuments({
        djId: userId,
        createdAt: { 
          $gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lt: lastWeek
        }
      }),

      // Current month earnings
      db.collection('requests').aggregate([
        { 
          $match: { 
            djId: userId, 
            status: 'completed',
            createdAt: { $gte: lastMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),

      // Previous month earnings
      db.collection('requests').aggregate([
        { 
          $match: { 
            djId: userId, 
            status: 'completed',
            createdAt: { 
              $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lt: lastMonth
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),

      // Total requests
      db.collection('requests').countDocuments({ djId: userId }),
      
      // Completed requests
      db.collection('requests').countDocuments({ 
        djId: userId, 
        status: 'completed' 
      }),
      
      // Upcoming events
      db.collection('events')
        .find({ 
          djId: userId,
          date: { $gte: now }
        })
        .sort({ date: 1 })
        .limit(5)
        .toArray(),
      
      // Top requested songs with song details
      db.collection('requests').aggregate([
        { $match: { djId: userId } },
        {
          $lookup: {
            from: 'songs',
            localField: 'songId',
            foreignField: '_id',
            as: 'songDetails'
          }
        },
        { $unwind: '$songDetails' },
        {
          $group: {
            _id: '$songId',
            title: { $first: '$songDetails.title' },
            artist: { $first: '$songDetails.artist' },
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
            lastRequested: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            amount: 1,
            count: 1,
            time: '$lastRequested'
          }
        }
      ]).toArray()
    ]);

    // Calculate percentage changes
    const requestsChange = lastWeekRequests > 0 
      ? Math.round(((currentRequests - lastWeekRequests) / lastWeekRequests) * 100)
      : 0;

    const earningsChange = lastMonthEarnings[0]?.total > 0
      ? Math.round(((currentEarnings[0]?.total - lastMonthEarnings[0]?.total) / lastMonthEarnings[0]?.total) * 100)
      : 0;

    // Calculate completion rate
    const completionRate = completedRequests > 0 
      ? Math.round((completedRequests / currentRequests) * 100) 
      : 0;

    // Format the response
    res.json({
      totalRequests: currentRequests,
      requestsChange,
      completedRequests,
      earnings: currentEarnings[0]?.total || 0,
      earningsChange,
      upcomingEvents,
      topSongs,
      completionRate
    });
  } catch (error) {
    console.error('Error fetching DJ stats:', error);
    res.status(500).json({ error: 'Failed to fetch DJ stats' });
  }
} 