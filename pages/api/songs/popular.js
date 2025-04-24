import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const bids = await getCollection('bids');
      
      // Get popular songs based on bid count
      const popularSongs = await bids.aggregate([
        {
          $group: {
            _id: '$songId',
            bidCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { bidCount: -1, totalAmount: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'songs',
            localField: '_id',
            foreignField: '_id',
            as: 'song'
          }
        },
        { $unwind: '$song' },
        {
          $project: {
            _id: '$song._id',
            spotifyId: '$song.spotifyId',
            title: '$song.title',
            artist: '$song.artist',
            albumArt: '$song.albumArt',
            duration_ms: '$song.duration_ms',
            bidCount: 1,
            totalAmount: 1
          }
        }
      ]).toArray();

      res.status(200).json(popularSongs);
    } catch (error) {
      console.error('Error fetching popular songs:', error);
      res.status(500).json({ error: 'Failed to fetch popular songs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 