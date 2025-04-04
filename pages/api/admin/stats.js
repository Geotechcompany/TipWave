import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add admin role check here once you implement roles
  // For now, we'll proceed with any authenticated user

  if (req.method === 'GET') {
    try {
      // Get collections
      const users = await getCollection('users');
      const bids = await getCollection('bids');
      const songs = await getCollection('songs');
      
      // Get counts
      const userCount = await users.countDocuments() || 0;
      const djCount = await users.countDocuments({ role: 'DJ' }) || 0;
      const bidCount = await bids.countDocuments() || 0;
      const songCount = await songs.countDocuments() || 0;
      
      // Calculate total revenue
      const totalRevenueAgg = await bids.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();
      
      // Get recent users
      const recentUsers = await users.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      // Get top songs based on bid count
      const topSongs = await songs.aggregate([
        { 
          $lookup: {
            from: 'bids',
            localField: '_id',
            foreignField: 'songId',
            as: 'bids'
          } 
        },
        { $addFields: { bidCount: { $size: "$bids" } } },
        { $sort: { bidCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            albumArt: 1,
            bidCount: 1
          }
        }
      ]).toArray();
      
      // Get recent bids
      const recentBids = await bids.aggregate([
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
      
      // Get bid status counts
      const bidStatusCounts = await bids.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      const statusMap = {};
      bidStatusCounts.forEach(status => {
        statusMap[status._id?.toLowerCase() || 'unknown'] = status.count;
      });

      res.status(200).json({
        totalUsers: userCount,
        activeDJs: djCount,
        totalBids: bidCount,
        totalSongs: songCount,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        recentUsers,
        topSongs,
        recentBids: recentBids.map(bid => ({
          ...bid,
          songTitle: bid.song?.title || 'Unknown Song',
          artist: bid.song?.artist || 'Unknown Artist'
        })),
        bidsByStatus: {
          pending: statusMap.pending || 0,
          completed: statusMap.completed || 0,
          rejected: statusMap.rejected || 0
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Error fetching admin stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}