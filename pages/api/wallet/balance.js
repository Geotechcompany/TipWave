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
    
    const userId = session.user.id;
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Get wallet balance
    const wallet = await db.collection('wallets').findOne({ 
      userId: new ObjectId(userId) 
    });
    
    // Return wallet balance (or 0 if no wallet found)
    return res.status(200).json({
      success: true,
      balance: wallet?.balance || 0,
      currency: wallet?.currency || 'KES',
      updatedAt: wallet?.updatedAt || new Date()
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch wallet balance',
      details: error.message 
    });
  }
} 