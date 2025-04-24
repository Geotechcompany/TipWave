import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

export default async function handler(req, res) {
  // Check authentication using NextAuth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
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
    const client = await clientPromise;
    const db = client.db();
    const songs = db.collection('songs');
    
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
    const bids = db.collection('bids');
    const newBid = {
      userId: session.user.id,
      amount: parseFloat(amount),
      songId: songDoc._id,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const bidResult = await bids.insertOne(newBid);

    const userEmail = session.user.email;
    const userName = session.user.name || userEmail.split('@')[0];

    // Send confirmation email
    await sendNotificationEmail(EmailTypes.BID_CREATED, userEmail, {
      userName,
      amount: newBid.amount,
      songTitle: songDoc.title
    });

    res.status(201).json({ id: bidResult.insertedId });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Error creating bid' });
  }
} 