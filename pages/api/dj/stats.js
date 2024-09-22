import { getAuth } from "@clerk/nextjs/server";
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const earnings = await prisma.bid.aggregate({
        where: { djId: userId },
        _sum: {
          amount: true
        }
      });

      const topSongs = await prisma.bid.groupBy({
        by: ['songId'],
        where: { djId: userId },
        _count: {
          songId: true
        },
        orderBy: {
          _count: {
            songId: 'desc'
          }
        },
        take: 3
      });

      const frequentUsers = await prisma.bid.groupBy({
        by: ['userId'],
        where: { djId: userId },
        _count: {
          userId: true
        },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 3
      });

      res.status(200).json({
        earnings: earnings._sum.amount || 0,
        topSongs: topSongs.map(s => s.songId),
        frequentUsers: frequentUsers.map(u => u.userId)
      });
    } catch (error) {
      console.error('Error fetching DJ stats:', error);
      res.status(500).json({ error: 'Error fetching DJ stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}