import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'DJ' && 
      session.user.role !== 'BOTH' && 
      session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - DJ permissions required' });
  }

  if (req.method === 'GET') {
    try {
      const bids = await getCollection('bids');
      
      // Get the queue with song details
      const queue = await bids.aggregate([
        {
          $match: {
            status: { $in: ['PENDING', 'ACCEPTED', 'PLAYING', 'NEXT'] }
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
        { $unwind: '$song' },
        {
          $sort: {
            bidAmount: -1,
            createdAt: 1
          }
        },
        {
          $project: {
            _id: 1,
            title: '$song.title',
            artist: '$song.artist',
            albumArt: '$song.albumArt',
            duration_ms: '$song.duration_ms',
            bidAmount: 1,
            status: 1,
            createdAt: 1
          }
        }
      ]).toArray();

      res.status(200).json(queue);
    } catch (error) {
      console.error('Error fetching song queue:', error);
      res.status(500).json({ error: 'Failed to fetch song queue' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 