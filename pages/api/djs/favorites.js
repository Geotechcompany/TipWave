import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      const djs = await getCollection('djs');
      const favorites = await getCollection('favorites');
      
      // Get user's favorite DJ IDs
      const userFavorites = await favorites
        .find({ clerkId })
        .toArray();
      
      const favoriteDjIds = userFavorites.map(fav => fav.djId);
      
      // Get full DJ details for favorites
      const favoriteDjs = await djs
        .find({ _id: { $in: favoriteDjIds } })
        .toArray();
      
      res.status(200).json(favoriteDjs);
    } catch (error) {
      console.error('Error fetching favorite DJs:', error);
      res.status(500).json({ error: 'Failed to fetch favorite DJs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 