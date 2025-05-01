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

    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const topUpAmount = parseFloat(amount);
    const userId = session.user.id;
    
    const client = await clientPromise;
    const db = client.db();
    
    // Use a transaction to ensure data consistency
    const mongoSession = client.startSession();
    
    try {
      await mongoSession.withTransaction(async () => {
        // Update wallet balance
        await db.collection('wallets').updateOne(
          { userId: new ObjectId(userId) },
          { 
            $inc: { balance: topUpAmount },
            $set: { updatedAt: new Date() }
          },
          { 
            session: mongoSession,
            upsert: true
          }
        );
        
        // Record the transaction
        await db.collection('transactions').insertOne({
          userId: new ObjectId(userId),
          type: 'topup',
          amount: topUpAmount,
          paymentMethod: paymentMethod || 'creditCard',
          status: 'COMPLETED',
          description: `Wallet top-up`,
          createdAt: new Date()
        }, { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }
    
    // Get the updated wallet balance
    const updatedWallet = await db.collection('wallets').findOne({
      userId: new ObjectId(userId)
    });
    
    res.status(200).json({
      success: true,
      message: 'Wallet topped up successfully',
      newBalance: updatedWallet?.balance || topUpAmount
    });
  } catch (error) {
    console.error('Error topping up wallet:', error);
    res.status(500).json({ error: 'Failed to top up wallet' });
  }
} 