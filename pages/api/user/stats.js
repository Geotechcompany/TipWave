import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const bids = await getCollection('bids');
      const songs = await getCollection('songs');
      
      // Get active bids
      const activeBids = await bids.aggregate([
        { 
          $match: { 
            clerkId,
            status: { $in: ['PENDING', 'ACCEPTED'] }
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
        { $sort: { createdAt: -1 } }
      ]).toArray();

      // Get past bids
      const pastBids = await bids.aggregate([
        { 
          $match: { 
            clerkId,
            status: { $in: ['COMPLETED', 'REJECTED', 'EXPIRED'] }
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
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } }
      ]).toArray();

      // Get other stats
      const totalBids = await bids.countDocuments({ clerkId });
      const wonBids = await bids.countDocuments({ clerkId, status: 'COMPLETED' });
      const totalSpentAgg = await bids.aggregate([
        { $match: { clerkId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();

      res.status(200).json({
        totalBids,
        wonBids,
        totalSpent: totalSpentAgg[0]?.total || 0,
        activeBids: activeBids.map(bid => ({
          id: bid._id,
          song: {
            title: bid.song.title,
            artist: bid.song.artist,
            albumArt: bid.song.albumArt
          },
          amount: bid.amount,
          status: bid.status,
          createdAt: bid.createdAt,
          djName: bid.djName
        })),
        pastBids: pastBids.map(bid => ({
          id: bid._id,
          song: {
            title: bid.song.title,
            artist: bid.song.artist,
            albumArt: bid.song.albumArt
          },
          amount: bid.amount,
          status: bid.status,
          createdAt: bid.createdAt,
          djName: bid.djName,
          eventName: bid.event?.name
        }))
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Error fetching user stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}