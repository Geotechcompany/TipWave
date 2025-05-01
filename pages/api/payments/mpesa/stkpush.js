import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { getTimestamp } from '@/lib/utils';

// Helper function to get OAuth token
async function getAccessToken() {
  try {
    const consumer_key = process.env.MPESA_CONSUMER_KEY;
    const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
    
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

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
    const { amount, phone, currency = 'KES', Order_ID } = req.body;
    
    if (!amount || !phone) {
      return res.status(400).json({ error: 'Amount and phone number are required' });
    }
    
    // Format phone number (ensure it has the country code)
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('254')) {
      // Remove leading zero if present
      formattedPhone = formattedPhone.replace(/^0/, '');
      // Add Kenyan country code
      formattedPhone = `254${formattedPhone}`;
    }
    
    // Get OAuth token
    const accessToken = await getAccessToken();
    
    const passkey = process.env.MPESA_PASS_KEY;
    const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    const timestamp = getTimestamp();
    
    // Create password
    const password = Buffer.from(
      `${businessShortCode}${passkey}${timestamp}`
    ).toString('base64');
    
    // Initiate STK push
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const callback_url = process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`;
    
    const stkPushResponse = await axios.post(
      url,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callback_url,
        AccountReference: "TipWave Wallet",
        TransactionDesc: "Top up wallet"
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    // If STK push is successful
    if (stkPushResponse.data.ResponseCode === "0") {
      const client = await clientPromise;
      const db = client.db();
      
      // Store pending transaction
      await db.collection('pendingTransactions').insertOne({
        userId: new ObjectId(userId),
        checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
        merchantRequestId: stkPushResponse.data.MerchantRequestID,
        amount: Number(amount),
        phone: formattedPhone,
        currency,
        type: 'topup',
        status: 'pending',
        orderId: Order_ID,
        createdAt: new Date()
      });
      
      return res.status(200).json(stkPushResponse.data);
    } else {
      return res.status(400).json({ 
        error: 'Failed to initiate M-Pesa payment',
        details: stkPushResponse.data
      });
    }
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
} 