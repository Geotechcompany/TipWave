
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { getTimestamp } from '@/lib/utils';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

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
    
    // Check if payment exists in our database
    const payment = await db.collection('mpesa_transactions').findOne({ 
      CheckoutRequestID: transactionId 
    });

    if (payment) {
      return res.status(200).json({
        success: true,
        status: payment.ResultCode === "0" ? "COMPLETED" : "FAILED",
        data: payment
      });
    }

    // If payment not found, check M-Pesa status
    // Generate token for M-Pesa API
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
    
    try {
      // First check if we have a pending transaction
      const pendingTx = await db.collection('pendingTransactions').findOne({
        checkoutRequestId: transactionId
      });

      // If the payment is still pending, send initial email notification for new transactions
      if (!payment && pendingTx && !pendingTx.emailSent) {
        try {
          // Find user for email notification
          const user = await db.collection('users').findOne({ 
            _id: pendingTx.userId 
          });
          
          if (user && user.email) {
            // Send pending notification email
            await sendNotificationEmail({
              type: EmailTypes.PAYMENT_STATUS,
              recipient: user.email,
              data: {
                status: 'PENDING',
                amount: pendingTx.amount,
                currency: pendingTx.currency || 'KES',
                transactionId: transactionId,
                date: new Date().toLocaleDateString()
              }
            });
            
            // Mark as email sent
            await db.collection('pendingTransactions').updateOne(
              { _id: pendingTx._id },
              { $set: { emailSent: true }}
            );
          }
        } catch (emailError) {
          console.error('Error sending pending payment notification email:', emailError);
          // Continue processing even if email fails
        }
      }

      // Skip M-Pesa API check if we already marked this as failed
      if (pendingTx && pendingTx.status === 'failed') {
        return res.status(200).json({
          success: false,
          status: "FAILED",
          data: pendingTx
        });
      }

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

      // Store result in database even for processing status
      if (statusResponse.data) {
        await db.collection('mpesa_transactions').updateOne(
          { CheckoutRequestID: transactionId },
          { $set: { ...statusResponse.data, updatedAt: new Date() } },
          { upsert: true }
        );

        // Handle "transaction is being processed" error
        if (statusResponse.data.errorCode === '500.001.1001') {
          return res.status(200).json({
            success: true,
            status: "PENDING",
            data: {
              message: "Transaction is still being processed",
              ...statusResponse.data
            }
          });
        }

        // Regular result handling for completed transactions
        if (statusResponse.data.ResultCode === "0" && pendingTx) {
          // First check if we already processed this transaction
          const existingTransaction = await db.collection('transactions').findOne({
            'details.checkoutRequestId': transactionId,
            status: 'COMPLETED'
          });

          if (!existingTransaction) {
            // Only process if not already completed
            const mongoSession = client.startSession();
            try {
              mongoSession.startTransaction();
              
              // Update transaction status
              await db.collection('pendingTransactions').updateOne(
                { checkoutRequestId: transactionId },
                { 
                  $set: { 
                    status: 'completed',
                    completedAt: new Date()
                  } 
                },
                { session: mongoSession }
              );
              
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
              
              await mongoSession.commitTransaction();
              console.log(`Wallet updated for user ${pendingTx.userId}, added ${pendingTx.amount}`);

              // Find the user details for email notification
              const user = await db.collection('users').findOne({ 
                _id: pendingTx.userId 
              });

              if (user && user.email) {
                // Get updated wallet for balance
                const wallet = await db.collection('wallets').findOne({ 
                  userId: pendingTx.userId 
                });
                
                // Send success email notification
                await sendNotificationEmail({
                  type: EmailTypes.PAYMENT_STATUS,
                  recipient: user.email,
                  data: {
                    status: 'COMPLETED',
                    amount: pendingTx.amount,
                    currency: pendingTx.currency || 'KES',
                    transactionId: transactionId,
                    balance: wallet?.balance || 0,
                    date: new Date().toLocaleDateString()
                  }
                });
              }
            } catch (error) {
              await mongoSession.abortTransaction();
              console.error('Transaction error:', error);
            } finally {
              await mongoSession.endSession();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking M-Pesa payment status:', error);
      
      // Special handling for "transaction is being processed" error
      if (error.response?.data?.errorCode === '500.001.1001') {
        return res.status(200).json({
          success: true,
          status: "PENDING",
          message: "Transaction is still being processed"
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check payment status',
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Error checking M-Pesa payment status:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to check payment status',
      details: error.message 
    });
  }
} 