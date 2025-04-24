import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

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
    const { id, name, artists, album } = req.body;

    if (!id || !name || !artists || !album) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db();
    const songs = db.collection('songs');
    
    // Check if song already exists
    const existingSong = await songs.findOne({ spotifyId: id });
    if (existingSong) {
      return res.status(200).json({ id: existingSong._id });
    }

    // Create new song
    const newSong = {
      spotifyId: id,
      title: name,
      artist: artists[0].name,
      artistId: artists[0].id,
      album: album.name,
      albumArt: album.images[0]?.url,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id || session.user.email
    };

    const result = await songs.insertOne(newSong);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Error creating song' });
  }
} 