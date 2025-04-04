import { getAuth } from "@clerk/nextjs/server";
import { spotifyApi, getValidToken } from '../../../lib/spotify';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);
  const { id } = req.query;

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!id) {
    return res.status(400).json({ error: "Spotify track ID is required" });
  }

  try {
    await getValidToken();
    const data = await spotifyApi.getTrack(id);
    res.status(200).json(data.body);
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    res.status(500).json({ error: 'Failed to fetch Spotify track' });
  }
} 