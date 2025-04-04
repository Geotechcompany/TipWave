import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add admin role check here
  
  if (req.method === 'GET') {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    try {
      const bids = await getCollection('bids');
      
      // Build query
      let query = {};
      if (status && status !== 'all') {
        query.status = status.toUpperCase();
      }
      
      if (search) {
        query.$or = [
          { "song.title": { $regex: search, $options: 'i' } },
          { "song.artist": { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get bids with joins
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'songs',
            localField: 'songId',
            foreignField: '_id',
            as: 'song'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'clerkId',
            foreignField: 'clerkId',
            as: 'user'
          }
        },
        { $unwind: { path: '$song', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            songId: 1,
            clerkId: 1,
            song: {
              title: '$song.title',
              artist: '$song.artist',
              albumArt: '$song.albumArt'
            },
            user: {
              name: '$user.name',
              email: '$user.email',
              image: '$user.image'
            }
          }
        }
      ];
      
      const bidData = await bids.aggregate(pipeline).toArray();
      
      // Get total count for pagination
      const total = await bids.countDocuments(query);
      
      res.status(200).json({
        bids: bidData,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching admin bids:', error);
      res.status(500).json({ error: 'Error fetching bids' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const bids = await getCollection('bids');
      
      // Validate status
      const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WON'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const result = await bids.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating bid:', error);
      res.status(500).json({ error: 'Error updating bid' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 