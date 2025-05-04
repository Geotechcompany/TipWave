import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { processMpesaPayment } from '@/utils/paymentProcessors';
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
    
    const userId = session.user.id;
    const { amount, phone, description = 'Wallet Top Up' } = req.body;
    
    // Validate request data
    if (!amount || amount <= 0 || !phone) {
      return res.status(400).json({ error: 'Invalid amount or phone number' });
    }
    
    // Find active M-PESA payment method
    const client = await clientPromise;
    const db = client.db();
    
    const mpesaMethod = await db.collection('paymentMethods').findOne({
      code: 'mpesa',
      isActive: true
    });
    
    if (!mpesaMethod) {
      return res.status(400).json({ error: 'M-PESA payment method not available' });
    }
    
    // Process payment using the utility function
    const result = await processMpesaPayment({
      amount,
      phoneNumber: phone,
      reference: description,
      paymentMethodId: mpesaMethod._id,
      userId
    });
    
    // Store the pending transaction in the database
    await db.collection('pendingTransactions').insertOne({
      userId: new ObjectId(userId),
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      amount: parseFloat(amount),
      phone,
      description,
      status: 'pending',
      paymentMethod: 'mpesa',
      createdAt: new Date()
    });
    
    return res.status(200).json({
      success: true,
      CheckoutRequestID: result.CheckoutRequestID,
      MerchantRequestID: result.MerchantRequestID
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