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

    // Aggregate song requests by genre
    const genreStats = await db.collection('song_requests')
      .aggregate([
        { $match: { djId: userId } },
        { $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();

    // Calculate total requests for percentage
    const totalRequests = genreStats.reduce((sum, genre) => sum + genre.count, 0);

    // Format response with percentages
    const topGenres = genreStats.map(genre => ({
      name: genre._id,
      percentage: Math.round((genre.count / totalRequests) * 100)
    }));

    res.status(200).json({ topGenres });
  } catch (error) {
    console.error('Error fetching genre stats:', error);
    res.status(500).json({ error: 'Failed to fetch genre stats' });
  }
} 