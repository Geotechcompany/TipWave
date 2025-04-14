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

    const requests = await db.collection('song_requests')
      .aggregate([
        { $match: { djId: userId } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: 'requesterId',
            foreignField: '_id',
            as: 'requester'
          }
        },
        { $unwind: '$requester' },
        {
          $project: {
            songTitle: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            requesterName: '$requester.name'
          }
        }
      ]).toArray();

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching recent requests:', error);
    res.status(500).json({ error: 'Failed to fetch recent requests' });
  }
} 