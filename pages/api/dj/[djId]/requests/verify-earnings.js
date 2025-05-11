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

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();
    
    console.log(`Verifying all completed song requests for DJ ID: ${djId}`);
    
    // Get all completed requests for this DJ
    const completedRequests = await db.collection('song_requests')
      .find({
        djId: djId,
        status: 'completed'
      })
      .toArray();
      
    // Also try with ObjectId
    const completedRequestsWithObjectId = await db.collection('song_requests')
      .find({
        djId: new ObjectId(djId),
        status: 'completed'
      })
      .toArray();
      
    // Combine and deduplicate
    const allCompletedRequests = [
      ...completedRequests,
      ...completedRequestsWithObjectId
    ];
    
    // Deduplicate by ID
    const requestMap = new Map();
    allCompletedRequests.forEach(req => {
      const id = req._id.toString();
      if (!requestMap.has(id)) {
        requestMap.set(id, req);
      }
    });
    
    const uniqueCompletedRequests = Array.from(requestMap.values());
    console.log(`Found ${uniqueCompletedRequests.length} unique completed requests`);
    
    // Get all transactions for this DJ to check which requests we already have transactions for
    const transactions = await db.collection('transactions')
      .find({
        userId: new ObjectId(djId),
        type: 'income'
      })
      .toArray();
      
    // Find completed requests that don't have a corresponding transaction
    const transactionRelatedIds = transactions.map(tx => 
      tx.relatedId?.toString()
    ).filter(Boolean);
    
    const missingTransactionRequests = uniqueCompletedRequests.filter(req => 
      !transactionRelatedIds.includes(req._id.toString())
    );
    
    console.log(`Found ${missingTransactionRequests.length} completed requests without transactions`);
    
    // Create transactions for any missing ones
    if (missingTransactionRequests.length > 0) {
      const session = client.startSession();
      
      try {
        await session.withTransaction(async () => {
          for (const request of missingTransactionRequests) {
            const amount = parseFloat(request.amount || 0);
            
            if (amount <= 0) {
              console.log(`Skipping request ${request._id}: invalid amount ${amount}`);
              continue;
            }
            
            // Create a transaction record
            await db.collection('transactions').insertOne({
              userId: new ObjectId(djId),
              type: 'income',
              amount: amount,
              relatedId: request._id,
              status: 'COMPLETED',
              description: `Accepted song request: ${request.songTitle || request.title || 'Unknown Song'}`,
              songTitle: request.songTitle || request.title,
              requesterName: request.requesterName || request.userName,
              createdAt: new Date()
            }, { session });
            
            // Also credit the DJ's wallet
            await db.collection('users').updateOne(
              { _id: new ObjectId(djId) },
              { $inc: { wallet: amount } },
              { session }
            );
            
            console.log(`Created transaction and credited wallet for request ${request._id}: $${amount}`);
          }
        });
        
        res.status(200).json({ 
          success: true, 
          updated: missingTransactionRequests.length > 0,
          requestsProcessed: missingTransactionRequests.length 
        });
      } finally {
        session.endSession();
      }
    } else {
      res.status(200).json({ 
        success: true, 
        updated: false,
        message: 'All completed requests already have transactions' 
      });
    }
  } catch (error) {
    console.error('Error verifying earnings:', error);
    res.status(500).json({ error: 'Failed to verify earnings', details: error.message });
  }
} 