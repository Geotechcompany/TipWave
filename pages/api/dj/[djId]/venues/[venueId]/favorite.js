import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract parameters
    const { djId, venueId } = req.query;
    const { isFavorite } = req.body;

    // Validate user ID matches session
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Update venue favorite status
    const result = await db.collection('venues').updateOne(
      { _id: new ObjectId(venueId), djId: session.user.id },
      { $set: { isFavorite: Boolean(isFavorite) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Venue favorite status updated'
    });
  } catch (error) {
    console.error('Error updating venue favorite status:', error);
    res.status(500).json({ error: 'Failed to update venue favorite status' });
  }
} 