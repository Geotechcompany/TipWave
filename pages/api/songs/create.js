import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
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

    const songs = await getCollection('songs');
    
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
      updatedAt: new Date()
    };

    const result = await songs.insertOne(newSong);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Error creating song' });
  }
} 