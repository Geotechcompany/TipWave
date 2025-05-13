import clientPromise from '@/lib/mongodb';
import { checkAdminAuth } from '@/lib/auth-middleware';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Check admin auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);

    // First get the user to verify existence
    const user = await db.collection('users').findOne(
      { _id: objectId },
      { projection: { _id: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Get or create wallet using ObjectId
        const wallet = await db.collection('wallets').findOne(
          { userId: objectId },
          { session }
        );

        if (!wallet) {
          await db.collection('wallets').insertOne({
            userId: objectId,
            balance: 0,
            currency: "USD",
            createdAt: new Date(),
            updatedAt: new Date()
          }, { session });
        }

        // Update wallet balance using ObjectId
        await db.collection('wallets').updateOne(
          { userId: objectId },
          { 
            $inc: { balance: parseFloat(amount) },
            $set: { updatedAt: new Date() }
          },
          { session }
        );

        // Record the transaction using ObjectId
        await db.collection('transactions').insertOne({
          userId: objectId,
          type: 'admin_adjustment',
          amount: parseFloat(amount),
          timestamp: new Date(),
          description: 'Admin balance adjustment',
          status: 'completed',
          currency: "USD",
          metadata: {
            adminId: authResult.user.id,
            adminEmail: authResult.user.email
          }
        }, { session });
      });

      // Get updated wallet data using ObjectId
      const updatedWallet = await db.collection('wallets').findOne({
        userId: objectId
      });

      return res.status(200).json({
        success: true,
        message: 'Wallet balance updated successfully',
        newBalance: updatedWallet?.balance || 0,
        currency: updatedWallet?.currency || 'USD'
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error updating wallet balance:', error);
    // Add better error handling for invalid ObjectId
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        details: error.message 
      });
    }
    return res.status(500).json({ 
      error: 'Failed to update wallet balance',
      details: error.message 
    });
  }
} 