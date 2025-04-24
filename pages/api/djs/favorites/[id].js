import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const client = await clientPromise;
      const db = client.db();
      const favorites = await db.collection('dj_favorites');
      
      await favorites.deleteOne({
        userId: session.user.id,
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