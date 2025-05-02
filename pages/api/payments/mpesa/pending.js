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
    
    // Get pending transactions
    const pendingTransactions = await db.collection('pendingTransactions')
      .find({ 
        userId: new ObjectId(userId),
        status: 'pending'
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return res.status(200).json({
      success: true,
      transactions: pendingTransactions
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending transactions',
      details: error.message 
    });
  }
} 