import { decryptData } from "./encryption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import axios from "axios";
import { getTimestamp } from "@/lib/utils";

export async function processMpesaPayment({ amount, phoneNumber, reference, paymentMethodId, userId }) {
  try {
    // Fetch the payment method with credentials from DB
    const client = await clientPromise;
    const db = client.db();
    
    const paymentMethod = await db.collection('paymentMethods').findOne({
      _id: paymentMethodId ? new ObjectId(paymentMethodId) : undefined,
      code: 'mpesa',
      isActive: true
    });
    
    if (!paymentMethod) {
      throw new Error('M-PESA payment method not found or inactive');
    }
    
    // Decrypt the credentials
    const credentials = paymentMethod.credentials || {};
    const consumerKey = credentials.consumerKey ? decryptData(credentials.consumerKey) : null;
    const consumerSecret = credentials.consumerSecret ? decryptData(credentials.consumerSecret) : null;
    const passKey = credentials.passKey ? decryptData(credentials.passKey) : null;
    const businessShortCode = credentials.businessShortCode ? decryptData(credentials.businessShortCode) : null;
    const callbackUrl = credentials.callbackUrl ? decryptData(credentials.callbackUrl) : null;
    
    if (!consumerKey || !consumerSecret || !passKey || !businessShortCode) {
      throw new Error('Incomplete M-PESA credentials');
    }
    
    // Format phone number (ensure it has the country code)
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('254')) {
      // Remove leading zero if present
      formattedPhone = formattedPhone.replace(/^0/, '');
      // Add Kenyan country code
      formattedPhone = `254${formattedPhone}`;
    }
    
    // Get OAuth token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    const timestamp = getTimestamp();
    
    // Create password
    const password = Buffer.from(
      `${businessShortCode}${passKey}${timestamp}`
    ).toString('base64');
    
    // Use callback URL from DB or fallback to env var
    const callback_url = callbackUrl || process.env.MPESA_CALLBACK_URL;
    
    // Initiate STK push
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    
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
        AccountReference: reference || "TipWave Wallet TopUp",
        TransactionDesc: "Top up your TipWave wallet"
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
      // Store pending transaction
      await db.collection('pendingTransactions').insertOne({
        userId: userId ? new ObjectId(userId) : null,
        checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
        merchantRequestId: stkPushResponse.data.MerchantRequestID,
        amount: Number(amount),
        phone: formattedPhone,
        currency: "KES",
        status: 'pending',
        createdAt: new Date()
      });
      
      return {
        success: true,
        CheckoutRequestID: stkPushResponse.data.CheckoutRequestID,
        MerchantRequestID: stkPushResponse.data.MerchantRequestID,
        message: 'Payment initiated successfully'
      };
    } else {
      throw new Error(`Failed to initiate M-PESA payment: ${JSON.stringify(stkPushResponse.data)}`);
    }
  } catch (error) {
    console.error('M-PESA payment processing error:', error);
    throw error;
  }
} 