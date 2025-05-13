import clientPromise from '@/lib/mongodb';
import { checkAdminAuth } from '@/lib/auth-middleware';

export default async function handler(req, res) {
  // Check admin auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // First get all users
    const users = await db.collection('users')
      .find({})
      .project({ _id: 1 })
      .toArray();

    // Get all wallets
    const wallets = await db.collection('wallets')
      .find({})
      .toArray();

    // Create a map of wallets by userId
    const walletMap = wallets.reduce((acc, wallet) => {
      acc[wallet.userId] = wallet;
      return acc;
    }, {});

    // Combine user IDs with their wallet data
    const walletsWithUserIds = users.map(user => {
      const userId = user._id.toString();
      const wallet = walletMap[userId] || {
        userId,
        balance: 0,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return wallet;
    });

    return res.status(200).json({
      success: true,
      wallets: walletsWithUserIds
    });

  } catch (error) {
    console.error('Error fetching wallets:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch wallets',
      details: error.message 
    });
  }
} 