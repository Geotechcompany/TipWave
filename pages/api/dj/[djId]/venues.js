import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    const [venues, stats] = await Promise.all([
      db.collection('venues')
        .find({ djId: userId })
        .sort({ name: 1 })
        .toArray(),
      db.collection('venues').aggregate([
        { $match: { djId: userId } },
        {
          $group: {
            _id: null,
            totalVenues: { $sum: 1 },
            favoriteVenues: {
              $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
            }
          }
        }
      ]).toArray(),
      db.collection('events').countDocuments({
        djId: userId,
        date: { $gte: new Date() }
      })
    ]);

    res.status(200).json({
      venues,
      stats: {
        totalVenues: stats[0]?.totalVenues || 0,
        favoriteVenues: stats[0]?.favoriteVenues || 0,
        upcomingEvents: stats[2] || 0
      }
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
} 