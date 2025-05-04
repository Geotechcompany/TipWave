import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

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

    const { requestRefund = true } = req.body;

    // Get the MongoDB client and connect to the database
    const client = await clientPromise;
    const db = client.db();
    
    // Start a MongoDB session for transaction
    const mongoSession = client.startSession();
    
    try {
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

      const refundAmount = request.amount;
      let refunded = false;

      // Process operations in a transaction
      await mongoSession.withTransaction(async () => {
        // Update the request status to 'cancelled'
        const result = await db.collection('song_requests').updateOne(
          { _id: new ObjectId(id) },
          { $set: { 
            status: 'cancelled',
            updatedAt: new Date()
          }},
          { session: mongoSession }
        );

        if (result.modifiedCount !== 1) {
          throw new Error('Failed to cancel request');
        }

        // Process refund if requested
        if (requestRefund && refundAmount > 0) {
          // Refund amount to user's wallet
          await db.collection('wallets').updateOne(
            { userId: new ObjectId(session.user.id) },
            { 
              $inc: { balance: refundAmount },
              $set: { updatedAt: new Date() }
            },
            { session: mongoSession }
          );

          // Create refund transaction record
          await db.collection('transactions').insertOne({
            userId: new ObjectId(session.user.id),
            type: 'refund',
            songTitle: request.songTitle,
            amount: refundAmount,
            relatedId: new ObjectId(id),
            djId: request.djId ? new ObjectId(request.djId) : null,
            djName: request.djName || null,
            status: 'COMPLETED',
            description: `Refund for cancelled song request: ${request.songTitle}`,
            createdAt: new Date()
          }, { session: mongoSession });

          refunded = true;
        }
      });

      // After the transaction completes successfully
      if (refunded) {
        // Get user's email
        const user = await db.collection('users').findOne(
          { _id: new ObjectId(session.user.id) },
          { projection: { email: 1, name: 1 } }
        );

        if (user?.email) {
          // Send refund confirmation email
          await sendNotificationEmail(EmailTypes.REQUEST_CANCELLED, {
            email: user.email,
            userName: user.name || user.email.split('@')[0],
            songTitle: request.songTitle,
            amount: refundAmount,
            formattedAmount: new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(refundAmount),
            cancelDate: new Date().toLocaleDateString(),
            requestId: id
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Request cancelled successfully',
        refunded,
        refundAmount: refunded ? refundAmount : 0
      });
    } finally {
      await mongoSession.endSession();
    }
  } catch (error) {
    console.error('Error cancelling request:', error);
    return res.status(500).json({ 
      error: 'Failed to cancel request',
      message: error.message 
    });
  }
} 