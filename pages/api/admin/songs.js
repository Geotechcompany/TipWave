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
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    try {
      const songs = await getCollection('songs');
      const bids = await getCollection('bids');
      
      // Build query
      let query = {};
      if (search) {
        query = { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { artist: { $regex: search, $options: 'i' } }
          ] 
        };
      }
      
      // Get songs with bid count
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'bids',
            localField: '_id',
            foreignField: 'songId',
            as: 'bids'
          }
        },
        { $addFields: { bidCount: { $size: "$bids" } } },
        { $sort: { bidCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            albumArt: 1,
            duration: 1,
            spotifyId: 1,
            createdAt: 1,
            bidCount: 1
          }
        }
      ];
      
      const songData = await songs.aggregate(pipeline).toArray();
      
      // Get total count for pagination
      const total = await songs.countDocuments(query);
      
      res.status(200).json({
        songs: songData,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching admin songs:', error);
      res.status(500).json({ error: 'Error fetching songs' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Song ID is required' });
      }
      
      const songs = await getCollection('songs');
      const bids = await getCollection('bids');
      
      // Check if song has any active bids
      const activeBids = await bids.countDocuments({ 
        songId: new ObjectId(id),
        status: { $in: ['PENDING', 'ACCEPTED'] }
      });
      
      if (activeBids > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete song with active bids' 
        });
      }
      
      // Delete song
      const result = await songs.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Song not found' });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({ error: 'Error deleting song' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 