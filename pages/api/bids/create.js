import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, song } = req.body;

    if (!amount || !song) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store song first
    const songs = await getCollection('songs');
    
    // Check if song already exists
    let songDoc = await songs.findOne({ spotifyId: song.id });
    
    if (!songDoc) {
      // Create new song with Spotify data
      const newSong = {
        spotifyId: song.id,
        title: song.name,
        artist: song.artists.map(a => a.name).join(', '),
        album: song.album.name,
        albumArt: song.album.images[0]?.url || '/images/default-album-art.jpg',
        duration_ms: song.duration_ms,
        explicit: song.explicit || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await songs.insertOne(newSong);
      songDoc = { _id: result.insertedId, ...newSong };
    }

    // Create bid
    const bids = await getCollection('bids');
    const newBid = {
      clerkId,
      amount: parseFloat(amount),
      songId: songDoc._id,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const bidResult = await bids.insertOne(newBid);
    res.status(201).json({ id: bidResult.insertedId });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Error creating bid' });
  }
} 