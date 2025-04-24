import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
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

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.query;
    const client = await clientPromise;
    const db = client.db();

    const requests = await db.collection('requests')
      .aggregate([
        {
          $match: {
            djId: djId,
            ...(status && { status })
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'requester'
          }
        },
        {
          $lookup: {
            from: 'songs',
            localField: 'songId',
            foreignField: '_id',
            as: 'song'
          }
        },
        { $unwind: '$requester' },
        { $unwind: '$song' },
        {
          $project: {
            title: '$song.title',
            artist: '$song.artist',
            amount: 1,
            status: 1,
            createdAt: 1,
            requesterName: '$requester.name',
            requesterId: '$requester._id'
          }
        },
        { $sort: { createdAt: -1 } }
      ]).toArray();

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
} 