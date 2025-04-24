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

    const client = await clientPromise;
    const db = client.db();
    
    // Get user balance
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { balance: 1 } }
    );
    
    // Return the balance (default to 0 if not set)
    return res.status(200).json({ 
      balance: user?.balance || 0 
    });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
} 