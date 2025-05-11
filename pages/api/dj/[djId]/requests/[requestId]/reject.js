import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { djId, requestId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();
    
    console.log(`Looking for request to reject with ID: ${requestId}, DJ ID: ${djId}`);
    
    // Try multiple approaches to find the request
    let songRequest;
    
    // First attempt: look in song_requests collection with direct match
    songRequest = await db.collection('song_requests').findOne({
      _id: new ObjectId(requestId),
      status: 'pending'
    });
    
    // If not found, try other collection names
    if (!songRequest) {
      console.log("Request not found in song_requests, trying requests collection");
      songRequest = await db.collection('requests').findOne({
        _id: new ObjectId(requestId),
        status: 'pending'
      });
    }
    
    // Try with string ID comparison if still not found
    if (!songRequest) {
      console.log("Trying with string ID comparison");
      
      // Get all pending requests and filter
      const allPendingRequests = await db.collection('song_requests')
        .find({ status: 'pending' })
        .toArray();
      
      songRequest = allPendingRequests.find(req => 
        req._id.toString() === requestId && 
        (req.djId === djId || req.djId?.toString() === djId)
      );
      
      // Try in requests collection if needed
      if (!songRequest) {
        const allPendingRequestsAlt = await db.collection('requests')
          .find({ status: 'pending' })
          .toArray();
        
        songRequest = allPendingRequestsAlt.find(req => 
          req._id.toString() === requestId && 
          (req.djId === djId || req.djId?.toString() === djId)
        );
      }
    }

    if (!songRequest) {
      console.log("Could not find the request in any collection");
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    
    console.log("Found request to reject:", songRequest);
    const amount = parseFloat(songRequest.amount || 0);
    const userId = songRequest.userId?.toString() || songRequest.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'Cannot identify user for refund' });
    }
    
    // Start a session for transaction
    const mongoSession = client.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // 1. Update the request status - use the collection where we found it
        const collection = songRequest._kCollectionName || 'song_requests';
        await db.collection(collection).updateOne(
          { _id: songRequest._id },
          { $set: { status: 'rejected' } },
          { session: mongoSession }
        );

        // 2. Refund the user's wallet
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { $inc: { wallet: amount } },
          { session: mongoSession }
        );

        // 3. Create transaction record for refund
        await db.collection('transactions').insertOne({
          userId: new ObjectId(userId),
          type: 'refund',
          amount: amount,
          relatedId: songRequest._id,
          status: 'COMPLETED',
          description: `Refund for rejected song request: ${songRequest.songTitle || songRequest.title || 'Unknown Song'}`,
          songTitle: songRequest.songTitle || songRequest.title,
          requesterName: songRequest.requesterName || songRequest.userName,
          createdAt: new Date()
        }, { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    res.status(200).json({ success: true, message: 'Request rejected and funds refunded' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request', details: error.message });
  }
} 