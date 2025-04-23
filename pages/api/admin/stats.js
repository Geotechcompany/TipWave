import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get counts
    const userCount = await db.collection('users').countDocuments();
    const djCount = await db.collection('users').countDocuments({ role: 'DJ' });
    const bidCount = await db.collection('song_requests').countDocuments();
    const songCount = await db.collection('songs').countDocuments();
    
    // Calculate total revenue
    const totalRevenueAgg = await db.collection('song_requests')
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();
    
    // Get recent users
    const recentUsers = await db.collection('users')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Get top songs
    const topSongs = await db.collection('songs')
      .aggregate([
        { 
          $lookup: {
            from: 'song_requests',
            localField: '_id',
            foreignField: 'songId',
            as: 'requests'
          } 
        },
        { $addFields: { requestCount: { $size: "$requests" } } },
        { $sort: { requestCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            albumArt: 1,
            requestCount: 1
          }
        }
      ]).toArray();
    
    // Get recent requests
    const recentRequests = await db.collection('song_requests')
      .aggregate([
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
        { $unwind: { path: '$song', preserveNullAndEmptyArrays: true } }
      ]).toArray();
    
    // Get request status counts
    const requestStatusCounts = await db.collection('song_requests')
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]).toArray();
    
    const statusMap = {};
    requestStatusCounts.forEach(status => {
      statusMap[status._id?.toLowerCase() || 'unknown'] = status.count;
    });

    // Get user growth data
    const userGrowth = await db.collection('users')
      .aggregate([
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": -1 } },
        { $limit: 7 }
      ]).toArray();

    // Get revenue by day
    const revenueByDay = await db.collection('song_requests')
      .aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id": -1 } },
        { $limit: 7 }
      ]).toArray();

    res.status(200).json({
      totalUsers: userCount,
      activeDJs: djCount,
      totalRequests: bidCount,
      totalSongs: songCount,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      recentUsers,
      topSongs,
      recentRequests: recentRequests.map(request => ({
        ...request,
        songTitle: request.song?.title || 'Unknown Song',
        artist: request.song?.artist || 'Unknown Artist'
      })),
      requestsByStatus: {
        pending: statusMap.pending || 0,
        completed: statusMap.completed || 0,
        rejected: statusMap.rejected || 0
      },
      userGrowth,
      revenueByDay
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
}