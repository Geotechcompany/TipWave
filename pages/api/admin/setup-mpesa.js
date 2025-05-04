import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { encryptData } from '@/utils/encryption';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { 
      consumerKey,
      consumerSecret,
      passKey,
      businessShortCode, 
      callbackUrl,
      isActive = true
    } = req.body;
    
    // Validate required fields
    if (!consumerKey || !consumerSecret || !passKey || !businessShortCode || !callbackUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'All M-PESA credentials are required' 
      });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Encrypt all credentials
    const encryptedCredentials = {
      consumerKey: encryptData(consumerKey),
      consumerSecret: encryptData(consumerSecret),
      passKey: encryptData(passKey),
      businessShortCode: encryptData(businessShortCode),
      callbackUrl: encryptData(callbackUrl)
    };
    
    // Check if M-PESA payment method already exists
    const existingMethod = await db.collection('paymentMethods').findOne({ code: 'mpesa' });
    
    if (existingMethod) {
      // Update existing method
      await db.collection('paymentMethods').updateOne(
        { code: 'mpesa' },
        { 
          $set: {
            credentials: encryptedCredentials,
            isActive,
            updatedAt: new Date()
          } 
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'M-PESA payment method updated successfully'
      });
    } else {
      // Create new payment method
      const paymentMethod = {
        name: 'M-PESA',
        code: 'mpesa',
        description: 'Pay with M-PESA mobile money',
        icon: '/images/mpesa-logo.png',
        processingFee: 0,
        isActive,
        requiresRedirect: false,
        supportedCurrencies: ['KES'],
        credentials: encryptedCredentials,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('paymentMethods').insertOne(paymentMethod);
      
      return res.status(201).json({
        success: true,
        message: 'M-PESA payment method created successfully',
        paymentMethodId: result.insertedId
      });
    }
  } catch (error) {
    console.error('Error setting up M-PESA payment method:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to set up M-PESA payment method',
      details: error.message 
    });
  }
} 