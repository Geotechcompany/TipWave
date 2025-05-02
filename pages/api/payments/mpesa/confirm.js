
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { getTimestamp } from '@/lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId } = req.query;

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // First check in mpesa_transactions collection
    const mpesaTransaction = await db.collection('mpesa_transactions').findOne({ 
      CheckoutRequestID: transactionId 
    });

    if (mpesaTransaction) {
      return res.status(200).json({
        success: true,
        status: mpesaTransaction.ResultCode === "0" ? "COMPLETED" : "FAILED",
        data: mpesaTransaction
      });
    }
    
    // If not found in mpesa_transactions, check in pendingTransactions
    const pendingTx = await db.collection('pendingTransactions').findOne({
      checkoutRequestId: transactionId
    });
    
    if (pendingTx) {
      // Get OAuth token for M-Pesa API
      const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString('base64');
      
      const tokenResponse = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      // Query transaction status from M-Pesa
      const timestamp = getTimestamp();
      const password = Buffer.from(
        `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASS_KEY}${timestamp}`
      ).toString('base64');
      
      console.log('Checking M-Pesa transaction status for:', transactionId);
      
      const statusResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        {
          BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: transactionId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('M-Pesa status response:', JSON.stringify(statusResponse.data, null, 2));

      // Store result in both collections for consistency
      if (statusResponse.data) {
        // Store in mpesa_transactions collection
        await db.collection('mpesa_transactions').updateOne(
          { CheckoutRequestID: transactionId },
          { $set: { ...statusResponse.data, updatedAt: new Date() } },
          { upsert: true }
        );
        
        // Update pending transaction status
        await db.collection('pendingTransactions').updateOne(
          { checkoutRequestId: transactionId },
          { 
            $set: { 
              mpesaResponse: statusResponse.data,
              status: statusResponse.data.ResultCode === "0" ? "COMPLETED" : "FAILED",
              updatedAt: new Date() 
            } 
          }
        );

        // If transaction successful, update user's wallet
        if (statusResponse.data.ResultCode === "0") {
          // Start MongoDB session for transaction
          const mongoSession = client.startSession();
          
          try {
            mongoSession.startTransaction();
            
            // Create a transaction record if not exists
            const existingTransaction = await db.collection('transactions').findOne({
              checkoutRequestId: transactionId
            }, { session: mongoSession });
            
            if (!existingTransaction) {
              await db.collection('transactions').insertOne({
                userId: pendingTx.userId,
                type: 'topup',
                amount: pendingTx.amount,
                currency: pendingTx.currency,
                paymentMethod: 'mpesa',
                status: 'COMPLETED',
                description: `M-Pesa wallet top-up`,
                details: {
                  checkoutRequestId: transactionId
                },
                createdAt: new Date()
              }, { session: mongoSession });
              
              // Update user's wallet balance
              await db.collection('wallets').updateOne(
                { userId: pendingTx.userId },
                { 
                  $inc: { balance: Number(pendingTx.amount) },
                  $set: { updatedAt: new Date() }
                },
                { 
                  session: mongoSession,
                  upsert: true
                }
              );
            }
            
            await mongoSession.commitTransaction();
          } catch (error) {
            await mongoSession.abortTransaction();
            console.error('Transaction error:', error);
          } finally {
            await mongoSession.endSession();
          }
        }

        return res.status(200).json({
          success: true,
          status: statusResponse.data.ResultCode === "0" ? "COMPLETED" : "FAILED",
          data: statusResponse.data
        });
      }
      
      // If we have a pending transaction but no status from M-Pesa yet
      return res.status(200).json({
        success: true,
        status: "PENDING",
        data: pendingTx
      });
    }

    return res.status(404).json({ 
      success: false, 
      error: 'Transaction not found or still pending'
    });
  } catch (error) {
    console.error('Error checking M-Pesa payment status:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to check payment status',
      details: error.message 
    });
  }
} 