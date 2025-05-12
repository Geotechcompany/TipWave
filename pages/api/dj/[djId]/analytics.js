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

    const client = await clientPromise;
    const db = client.db();

    // Get timeframe from query params
    const { timeframe = 'month' } = req.query;
    const startDate = getStartDate(timeframe);

    // Fetch request trends
    const requestTrends = await db.collection('song_requests')
      .aggregate([
        {
          $match: {
            djId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 },
            revenue: { $sum: { $toDouble: "$amount" } }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();

    // Fetch popular songs
    const popularSongs = await db.collection('song_requests')
      .aggregate([
        {
          $match: {
            djId,
            status: 'accepted',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: "$songId",
            requestCount: { $sum: 1 },
            totalRevenue: { $sum: { $toDouble: "$amount" } },
            songDetails: { $first: "$$ROOT" }
          }
        },
        { $sort: { requestCount: -1 } },
        { $limit: 5 }
      ]).toArray();

    // Calculate audience stats
    const audienceStats = await db.collection('song_requests')
      .aggregate([
        {
          $match: {
            djId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalRevenue: { $sum: { $toDouble: "$amount" } },
            uniqueRequesters: { $addToSet: "$userId" },
            avgRequestValue: { $avg: { $toDouble: "$amount" } }
          }
        }
      ]).toArray();

    // Format the response
    const response = {
      requestTrends: requestTrends.map(trend => ({
        date: trend._id,
        requests: trend.count,
        revenue: trend.revenue
      })),
      popularSongs: popularSongs.map(song => ({
        id: song._id,
        title: song.songDetails.title,
        artist: song.songDetails.artist,
        requestCount: song.requestCount,
        totalRevenue: song.totalRevenue
      })),
      audienceStats: audienceStats[0] || {
        totalRequests: 0,
        totalRevenue: 0,
        uniqueRequesters: [],
        avgRequestValue: 0
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

function getStartDate(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
} 