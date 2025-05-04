import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const userId = session.user.id;
    
    // First check in wallets collection
    const wallet = await db.collection('wallets').findOne({ 
      userId: new ObjectId(userId) 
    });
    
    // Log what we found for debugging
    console.log('Wallet lookup results:', { 
      walletFound: !!wallet, 
      walletBalance: wallet?.balance 
    });
    
    if (wallet && typeof wallet.balance === 'number') {
      return res.status(200).json({ 
        balance: wallet.balance,
        source: 'wallets'
      });
    }
    
    // If not found in wallets, check in users collection
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(userId) 
    });
    
    // Log user wallet info for debugging
    console.log('User lookup results:', { 
      userFound: !!user, 
      userWallet: user?.wallet 
    });
    
    // Always return a number
    const balance = typeof user?.wallet === 'number' ? user.wallet : 0;
    
    return res.status(200).json({ 
      balance: balance,
      source: 'users'
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
} 