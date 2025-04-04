import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);
  const { id } = req.query;

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === 'DELETE') {
    try {
      const favorites = await getCollection('favorites');
      
      await favorites.deleteOne({
        clerkId,
        djId: new ObjectId(id)
      });
      
      res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
      console.error('Error removing favorite DJ:', error);
      res.status(500).json({ error: 'Failed to remove favorite DJ' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 