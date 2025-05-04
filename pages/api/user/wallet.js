import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getWalletByUserId } from '@/lib/models/Wallet';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get wallet for this user
    const userId = session.user.id;
    let wallet = await getWalletByUserId(userId);
    
    // If wallet doesn't exist, create one
    if (!wallet) {
      const client = await clientPromise;
      const db = client.db();
      
      // Create new wallet with zero balance
      const newWallet = {
        userId: new ObjectId(userId),
        balance: 0,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('wallets').insertOne(newWallet);
      wallet = newWallet;
    }
    
    // Return the wallet balance
    return res.status(200).json({ 
      balance: wallet.balance || 0,
      currency: wallet.currency || 'USD'
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
} 