import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get pagination parameters
    const { limit = 10, skip = 0, status } = req.query;

    // Build the query
    const query = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    // Fetch user requests with DJ information
    const requests = await db.collection('song_requests')
      .aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'djId',
            foreignField: '_id',
            as: 'dj'
          }
        },
        { $unwind: { path: '$dj', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            songTitle: 1,
            songArtist: 1,
            albumArt: 1,
            amount: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            djName: '$dj.name',
            djId: 1
          }
        }
      ])
      .toArray();

    // Count total for pagination
    const total = await db.collection('song_requests').countDocuments(query);

    res.status(200).json({
      requests,
      pagination: {
        total,
        hasMore: parseInt(skip) + requests.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
} 