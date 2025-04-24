import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { searchTracks } from '../../../lib/spotify';

export default async function handler(req, res) {
  // Check authentication using NextAuth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { query } = req.query;
  
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