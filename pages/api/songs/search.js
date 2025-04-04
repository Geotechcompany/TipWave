import { getAuth } from "@clerk/nextjs/server";
import { searchTracks } from '../../../lib/spotify';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);
  const { query } = req.query;

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const tracks = await searchTracks(query);
    res.status(200).json(tracks);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
}