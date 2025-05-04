import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
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
    const userId = session.user.id;

    // Handle GET request to fetch user transactions
    if (req.method === 'GET') {
      const { limit = 10, page = 1, type, all = false, export: isExport = false } = req.query;
      
      // If exporting or fetching all, use larger limit
      const effectiveLimit = isExport === 'true' || all === 'true' ? 1000 : parseInt(limit);
      const skip = (parseInt(page) - 1) * effectiveLimit;
      
      // Build query filter
      const filter = { userId: new ObjectId(userId) };
      if (type && type !== 'all') {
        filter.type = type;
      }
      
      // Fetch transactions with pagination
      const transactions = await db.collection('transactions')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(all === 'true' ? 0 : skip)
        .limit(parseInt(effectiveLimit))
        .toArray();
      
      const total = await db.collection('transactions').countDocuments(filter);
      
      // Format transactions to ensure they're serializable
      const formattedTransactions = transactions.map(tx => ({
        ...tx,
        _id: tx._id.toString(),
        userId: tx.userId.toString(),
        djId: tx.djId ? tx.djId.toString() : null,
        relatedId: tx.relatedId ? tx.relatedId.toString() : null
      }));
      
      return res.status(200).json({
        transactions: formattedTransactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(effectiveLimit),
          pages: Math.ceil(total / parseInt(effectiveLimit))
        }
      });
    }

    // Handle POST request for creating a new transaction
    if (req.method === 'POST') {
      const { amount, currencyCode, type, paymentMethod } = req.body;
      
      // Validate input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      if (!type || !['topup'].includes(type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      // Get default currency if not specified
      let currency;
      if (currencyCode) {
        currency = await db.collection('currencies').findOne({ code: currencyCode });
      }
      
      if (!currency) {
        currency = await db.collection('currencies').findOne({ isDefault: true });
      }
      
      if (!currency) {
        return res.status(500).json({ error: 'Currency not found' });
      }

      // Create transaction record
      const transaction = {
        userId,
        amount: Number(amount),
        currencyCode: currency.code,
        type, 
        paymentMethod,
        status: 'completed', // In a real app, this might be 'pending' until payment confirmed
        createdAt: new Date()
      };
      
      // Insert transaction
      const result = await db.collection('transactions').insertOne(transaction);
      
      // Update user balance
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { balance: Number(amount) } }
      );
      
      // Get the updated user balance
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      
      // Return success with new balance
      return res.status(200).json({
        success: true,
        transactionId: result.insertedId,
        newBalance: user.balance || amount,
        message: 'Transaction completed successfully'
      });
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
} 