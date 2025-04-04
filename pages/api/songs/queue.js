import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const bids = await getCollection('bids');
      const songs = await getCollection('songs');
      
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