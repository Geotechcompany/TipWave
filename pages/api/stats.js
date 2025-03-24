import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../lib/db';

export default async function handler(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const users = await getCollection('users');
      const bids = await getCollection('bids');
      
      const userCount = await users.countDocuments();
      const djCount = await users.countDocuments({ role: 'DJ' });
      const bidCount = await bids.countDocuments();
      
      const totalRevenue = await bids.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();

      res.status(200).json({
        users: userCount,
        djs: djCount,
        bids: bidCount,
        revenue: totalRevenue[0]?.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Error fetching stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}