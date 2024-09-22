import { requireAuth } from '../../lib/auth';
import { searchSpotify } from '../../lib/spotify';

export default async function handler(req, res) {
  if (!(await requireAuth(req))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    const { query } = req.query;
    try {
      const songs = await searchSpotify(query);
      res.status(200).json(songs);
    } catch (error) {
      console.error('Error searching songs:', error);
      res.status(500).json({ error: 'Error searching songs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}