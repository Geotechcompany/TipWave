import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const bids = await getCollection('bids');
      
      const earnings = await bids.aggregate([
        { $match: { djId: clerkId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();

      const topSongs = await bids.aggregate([
        { $match: { djId: clerkId } },
        { $group: { 
          _id: "$songId",
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]).toArray();

      const frequentUsers = await bids.aggregate([
        { $match: { djId: clerkId } },
        { $group: { 
          _id: "$clerkId",
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]).toArray();

      res.status(200).json({
        earnings: earnings[0]?.total || 0,
        topSongs: topSongs.map(s => s._id),
        frequentUsers: frequentUsers.map(u => u._id)
      });
    } catch (error) {
      console.error('Error fetching DJ stats:', error);
      res.status(500).json({ error: 'Error fetching DJ stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}