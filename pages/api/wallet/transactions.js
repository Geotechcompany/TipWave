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
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Build query
    const query = { userId: new ObjectId(userId) };
    
    // Add type filter if specified
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Get transactions
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count for pagination
    const total = await db.collection('transactions')
      .countDocuments(query);
    
    // Format ObjectId to string to make it JSON serializable
    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      _id: tx._id.toString(),
      userId: tx.userId.toString()
    }));
    
    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
}