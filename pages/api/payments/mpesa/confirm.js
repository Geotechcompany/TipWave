import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { getTimestamp } from '@/lib/utils';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';
import { decryptData } from '@/utils/encryption';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId } = req.query;

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    console.log('Checking transaction status for:', transactionId);
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // First check if we have a callback result already
    const transaction = await db.collection('transactions').findOne({
      'details.checkoutRequestId': transactionId
    });
    
    if (transaction && transaction.status !== 'PENDING') {
      console.log('Transaction already processed:', transaction.status);
      return res.status(200).json({
        success: true,
        status: transaction.status,
        data: transaction
      });
    }
    
    // Find the pending transaction
    const pendingTx = await db.collection('transactions').findOne({
      'details.checkoutRequestId': transactionId,
      status: 'PENDING'
    });
    
    if (!pendingTx) {
      console.log('No pending transaction found with ID:', transactionId);
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Get credentials from database (not environment variables)
    const mpesaPaymentMethod = await db.collection('paymentMethods').findOne({ 
      code: 'mpesa',
      isActive: true 
    });
    
    if (!mpesaPaymentMethod) {
      return res.status(500).json({ error: 'M-Pesa payment method not found or inactive' });
    }
    
    // Decrypt the credentials from database
    const credentials = mpesaPaymentMethod.credentials || {};
    const consumerKey = credentials.consumerKey ? decryptData(credentials.consumerKey) : null;
    const consumerSecret = credentials.consumerSecret ? decryptData(credentials.consumerSecret) : null;
    const passkey = credentials.passKey ? decryptData(credentials.passKey) : null;
    const shortcode = credentials.businessShortCode ? decryptData(credentials.businessShortCode) : null;
    
    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return res.status(500).json({ error: 'M-Pesa configuration incomplete in database' });
    }
    
    // Get OAuth token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
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
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    console.log('Querying M-Pesa for status of transaction:', transactionId);
    
    const statusResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: shortcode,
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
    
    // Process the response
    const responseCode = statusResponse.data.ResponseCode;
    let newStatus = 'PENDING';
    
    if (responseCode === '0') {
      // Check the result code
      if (statusResponse.data.ResultCode === '0') {
        newStatus = 'COMPLETED';
      } else {
        newStatus = 'FAILED';
      }
      
      // Update transaction status
      await db.collection('transactions').updateOne(
        { 'details.checkoutRequestId': transactionId },
        { 
          $set: { 
            status: newStatus,
            'details.mpesaResponse': statusResponse.data,
            updatedAt: new Date()
          } 
        }
      );
      
      // If completed, update user's wallet and send email notification
      if (newStatus === 'COMPLETED') {
        const userId = pendingTx.userId;
        
        // Add amount to wallet
        await db.collection('wallets').updateOne(
          { userId: userId },
          { 
            $inc: { balance: pendingTx.amount },
            $set: { updatedAt: new Date() }
          }
        );
        
        // Get user details for email notification
        const user = await db.collection('users').findOne({ _id: userId });
        
        if (user && user.email) {
          try {
            // Send success email notification
            await sendNotificationEmail({
              type: EmailTypes.PAYMENT_STATUS,
              recipient: user.email,
              data: {
                name: user.name || 'Valued Customer',
                status: 'COMPLETED',
                amount: pendingTx.amount,
                currency: 'KES',
                transactionId: transactionId,
                date: new Date().toLocaleDateString(),
                paymentMethod: 'M-Pesa',
                description: 'Wallet Top-up'
              }
            });
            console.log('Payment success email sent to:', user.email);
          } catch (emailError) {
            console.error('Error sending payment success email:', emailError);
            // Continue processing even if email fails
          }
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      status: newStatus,
      data: statusResponse.data
    });
    
  } catch (error) {
    console.error('M-Pesa confirmation error:', error);
    return res.status(500).json({ 
      error: 'Failed to confirm payment status',
      details: error.message
    });
  }
} 