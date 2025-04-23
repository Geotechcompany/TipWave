import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    
    // Get recent song requests (activity)
    const songRequests = await db.collection('song_requests')
      .aggregate([
        { $match: { userId: session.user.id } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
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
            type: { $literal: 'request' },
            title: { $concat: ['Requested "', '$songTitle', '" from ', { $ifNull: ['$dj.name', 'Unknown DJ'] }] },
            timestamp: '$createdAt',
            status: 1,
            amount: 1
          }
        }
      ]).toArray();

    // You can add more activity types here, like tips, favorites, etc.
    // For example, fetch recent tips or DJ follows
    
    // Format the activities for the frontend
    const activities = songRequests.map(activity => ({
      _id: activity._id,
      type: activity.type,
      title: activity.title,
      timestamp: activity.timestamp,
      status: activity.status,
      amount: activity.amount
    }));

    res.status(200).json({
      activities
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
} 