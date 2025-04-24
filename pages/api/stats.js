import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { getCollection } from '../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
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