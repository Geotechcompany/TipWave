import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { getTimestamp } from '@/lib/utils';

// Helper function to get OAuth token (same as in stkpush.js)
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { checkoutRequestId } = req.query;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'Checkout request ID is required' });
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
    
    // Query STK status
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
    
    const response = await axios.post(
      url,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    // Check the database for the transaction status as well
    const client = await clientPromise;
    const db = client.db();
    
    const transaction = await db.collection('pendingTransactions').findOne({
      checkoutRequestId
    });
    
    if (transaction && transaction.status === 'completed') {
      // If our database shows it's completed, override the API response
      return res.status(200).json({ 
        ...response.data,
        ResultCode: "0",
        ResultDesc: "The service request is processed successfully.",
        dbStatus: transaction.status
      });
    }
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error confirming M-Pesa payment:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
} 