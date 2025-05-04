import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { songId, djId } = req.body;

    // Validate required fields
    if (!songId || !djId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Check for recent duplicate within the last 60 minutes
    const recentDuplicate = await db.collection('song_requests').findOne({
      userId: session.user.id,
      djId: djId,
      songId: songId,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });
    
    return res.status(200).json({
      isDuplicate: !!recentDuplicate,
      request: recentDuplicate ? {
        id: recentDuplicate._id.toString(),
        songTitle: recentDuplicate.songTitle,
        createdAt: recentDuplicate.createdAt
      } : null
    });
  } catch (error) {
    console.error('Error checking for duplicate request:', error);
    res.status(500).json({ error: 'Failed to check for duplicate request' });
  }
}
