import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    // Get the MongoDB client and connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // First, verify that the request belongs to the user
    const request = await db.collection('song_requests').findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or does not belong to you' });
    }

    // Check if the request is in a state that can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Only pending requests can be cancelled' 
      });
    }

    // Update the request status to 'cancelled'
    const result = await db.collection('song_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: { 
        status: 'cancelled',
        updatedAt: new Date()
      }}
    );

    if (result.modifiedCount !== 1) {
      return res.status(500).json({ error: 'Failed to cancel request' });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Request cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    return res.status(500).json({ error: 'Failed to cancel request' });
  }
} 