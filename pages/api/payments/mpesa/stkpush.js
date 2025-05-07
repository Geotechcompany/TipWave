import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { decryptData } from '@/utils/encryption'; // Import the decryption function

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
    
    // Get M-Pesa payment method
    const mpesaPaymentMethod = await db.collection('paymentMethods').findOne({ 
      code: 'mpesa',
      isActive: true 
    });
    
    if (!mpesaPaymentMethod) {
      return res.status(500).json({ error: 'M-Pesa payment method not found or inactive' });
    }
    
    // Decrypt the credentials just like in paymentProcessors.js
    const credentials = mpesaPaymentMethod.credentials || {};
    
    // Access and decrypt the credentials from the credentials object
    const consumerKey = credentials.consumerKey ? decryptData(credentials.consumerKey) : null;
    const consumerSecret = credentials.consumerSecret ? decryptData(credentials.consumerSecret) : null;
    const passkey = credentials.passKey ? decryptData(credentials.passKey) : null;
    const shortcode = credentials.businessShortCode ? decryptData(credentials.businessShortCode) : null;
    const callbackUrl = credentials.callbackUrl ? 
      decryptData(credentials.callbackUrl) : 
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mpesa/callback`;
    
    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      return res.status(500).json({ error: 'M-Pesa configuration incomplete in database' });
    }

    console.log('Successfully decrypted M-Pesa credentials');

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    // Get OAuth token with decrypted credentials
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    const token = authResponse.data.access_token;
    
    console.log('STK Push request payload:', {
      BusinessShortCode: shortcode,
      PhoneNumber: formattedPhoneNumber,
      Amount: Math.round(amount)
    });

    // Make STK Push request with decrypted credentials
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa expects integer amount
        PartyA: formattedPhoneNumber,
        PartyB: shortcode,
        PhoneNumber: formattedPhoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: `Wallet-${session.user.id}`,
        TransactionDesc: 'Wallet Top-up'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create a pending transaction record
    const pendingTransaction = {
      userId: new ObjectId(session.user.id),
      phoneNumber: formattedPhoneNumber,
      amount: Number(amount),
      status: 'PENDING',
      type: 'topup',
      paymentMethod: 'mpesa',
      details: {
        checkoutRequestId: stkResponse.data.CheckoutRequestID,
        merchantRequestId: stkResponse.data.MerchantRequestID,
        phoneNumber: formattedPhoneNumber
      },
      createdAt: new Date()
    };
    
    const result = await db.collection('transactions').insertOne(pendingTransaction);
    
    return res.status(200).json({
      success: true,
      transactionId: result.insertedId.toString(),
      CheckoutRequestID: stkResponse.data.CheckoutRequestID,
      MerchantRequestID: stkResponse.data.MerchantRequestID,
      message: 'STK push request initiated. Please check your phone to complete the payment.'
    });
    
  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    return res.status(500).json({ 
      error: error.response?.data?.errorMessage || 'Failed to process payment',
      details: error.message
    });
  }
}