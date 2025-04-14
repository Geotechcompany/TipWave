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

    // Get total and completed requests
    const totalRequests = await db.collection('song_requests')
      .countDocuments({ djId: userId });
    
    const completedRequests = await db.collection('song_requests')
      .countDocuments({ djId: userId, status: 'completed' });

    // Calculate total earnings
    const earnings = await db.collection('song_requests')
      .aggregate([
        { $match: { djId: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();

    // Get recent requests
    const recentRequests = await db.collection('song_requests')
      .find({ djId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get top songs
    const topSongs = await db.collection('song_requests')
      .aggregate([
        { $match: { djId: userId } },
        { $group: { 
          _id: '$songId',
          title: { $first: '$songTitle' },
          artist: { $first: '$songArtist' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();

    // Get upcoming events
    const upcomingEvents = await db.collection('events')
      .find({ 
        djId: userId,
        date: { $gte: new Date() }
      })
      .sort({ date: 1 })
      .limit(3)
      .toArray();

    // Calculate weekly trends
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const weeklyStats = await db.collection('song_requests')
      .aggregate([
        { 
          $match: { 
            djId: userId,
            createdAt: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: null,
            requestCount: { $sum: 1 },
            earnings: { $sum: '$amount' }
          }
        }
      ]).toArray();

    const previousWeek = new Date(lastWeek);
    previousWeek.setDate(previousWeek.getDate() - 7);

    const previousWeekStats = await db.collection('song_requests')
      .aggregate([
        { 
          $match: { 
            djId: userId,
            createdAt: { 
              $gte: previousWeek,
              $lt: lastWeek
            }
          }
        },
        {
          $group: {
            _id: null,
            requestCount: { $sum: 1 },
            earnings: { $sum: '$amount' }
          }
        }
      ]).toArray();

    // Calculate percentage changes
    const requestsTrend = weeklyStats[0] && previousWeekStats[0] 
      ? ((weeklyStats[0].requestCount - previousWeekStats[0].requestCount) / previousWeekStats[0].requestCount) * 100
      : 0;

    const earningsTrend = weeklyStats[0] && previousWeekStats[0]
      ? ((weeklyStats[0].earnings - previousWeekStats[0].earnings) / previousWeekStats[0].earnings) * 100
      : 0;

    res.status(200).json({
      totalRequests,
      completedRequests,
      earnings: earnings[0]?.total || 0,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
      recentRequests,
      topSongs,
      upcomingEvents,
      trends: {
        requests: Math.round(requestsTrend),
        earnings: Math.round(earningsTrend)
      }
    });

  } catch (error) {
    console.error('Error fetching DJ stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
} 