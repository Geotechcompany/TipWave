import { requireAuth } from '../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (!(await requireAuth(req))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add admin role check here

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
        totalBids: bidCount,
        totalRevenue: totalRevenue._sum.amount || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Error fetching admin stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}