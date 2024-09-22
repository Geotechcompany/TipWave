import { getAuth } from "@clerk/nextjs/server";
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const userCount = await prisma.user.count();
      const djCount = await prisma.user.count({ where: { role: 'DJ' } });
      const bidCount = await prisma.bid.count();
      const totalRevenue = await prisma.bid.aggregate({
        _sum: {
          amount: true
        }
      });

      res.status(200).json({
        users: userCount,
        djs: djCount,
        bids: bidCount,
        revenue: totalRevenue._sum.amount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Error fetching stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}