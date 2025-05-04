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

    // Extract request data
    const { phoneNumber, amount } = req.body;

    // Validate required fields
    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format phone number (remove leading 0 and add country code if needed)
    let formattedPhoneNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhoneNumber = `254${phoneNumber.substring(1)}`;
    }
    if (!phoneNumber.startsWith('254')) {
      formattedPhoneNumber = `254${phoneNumber}`;
    }

    // Connect to MongoDB to create a pending transaction
    const client = await clientPromise;
    const db = client.db();
    
    // Create a pending transaction record
    const pendingTransaction = {
      userId: new ObjectId(session.user.id),
      phoneNumber: formattedPhoneNumber,
      amount: Number(amount),
      status: 'PENDING',
      type: 'topup',
      paymentMethod: 'mpesa',
      createdAt: new Date()
    };
    
    const result = await db.collection('transactions').insertOne(pendingTransaction);
    
    // In a real implementation, you would call the M-PESA API here
    // For now, we'll simulate a successful request
    
    return res.status(200).json({
      success: true,
      transactionId: result.insertedId.toString(),
      message: 'STK push request initiated. Please check your phone to complete the payment.'
    });
  } catch (error) {
    console.error('Error initiating M-PESA payment:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to initiate payment',
      details: error.message 
    });
  }
}