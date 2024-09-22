import { getAuth } from "@clerk/nextjs/server";
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const totalBids = await prisma.bid.count({
        where: { userId }
      });

      const wonBids = await prisma.bid.count({
        where: { userId, status: 'WON' }
      });

      const totalSpent = await prisma.bid.aggregate({
        where: { userId },
        _sum: {
          amount: true
        }
      });

      const activeBids = await prisma.bid.findMany({
        where: { 
          userId,
          status: { in: ['PENDING', 'ACCEPTED', 'REJECTED'] }
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          song: { select: { title: true, artist: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        totalBids,
        wonBids,
        totalSpent: totalSpent._sum.amount || 0,
        activeBids
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Error fetching user stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}