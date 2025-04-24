import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { spotifyApi, getValidToken } from '../../../lib/spotify';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

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