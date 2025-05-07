import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    console.log(`Cancelling transaction ${transactionId} for user ${userId}`);
    
    // Find the transaction first to verify ownership
    const transaction = await db.collection('transactions').findOne({
      'details.checkoutRequestId': transactionId,
      userId: new ObjectId(userId),
      status: 'PENDING'
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found or already processed' 
      });
    }
    
    // Update the transaction in the transactions collection (not pendingTransactions)
    const result = await db.collection('transactions').updateOne(
      { 
        'details.checkoutRequestId': transactionId,
        status: 'PENDING'
      },
      { 
        $set: { 
          status: 'CANCELLED',
          'details.failureReason': 'Manually cancelled by user',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found or already processed' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Transaction cancelled successfully',
      transactionId
    });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel transaction',
      details: error.message 
    });
  }
}