import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Encryption function similar to your utils/encryption.js but self-contained
function encryptData(text) {
  if (!text) return null;
  
  try {
    // This fixes the key length issue
    const rawKey = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only';
    
    // Create a consistent 32-byte key by hashing the raw key
    const ENCRYPTION_KEY = crypto.createHash('sha256').update(rawKey).digest();
    const ALGORITHM = 'aes-256-cbc';
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

/**
 * Script to add M-PESA payment method to the database
 * 
 * Usage:
 * Run with: node scripts/add-mpesa-payment-method.js
 */
async function addMpesaPaymentMethod() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is not defined');
    console.error('Make sure you have a .env file with MONGODB_URI defined');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // M-PESA credentials to be encrypted and stored
    const mpesaConfig = {
      consumerKey: "01v81EqZptKUHVPgTQlmRV0p53U6PPKNTXGS4MGIIEWiqEeN",
      consumerSecret: "tYCAmiY0WKLMXNTKxXbphhH0UntdWxxng4GewJsUuBusNsw7sSIqQl5O2Pepkqjb",
      passKey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      businessShortCode: "174379",
      callbackUrl: "https://tipwave.netlify.app/api/payments/mpesa/callback"
    };

    console.log('Using M-PESA configuration:');
    console.log({
      consumerKey: '✓ Using provided value',
      consumerSecret: '✓ Using provided value',
      passKey: '✓ Using provided value',
      businessShortCode: '✓ Using provided value',
      callbackUrl: '✓ Using provided value',
    });

    // Encrypt all credentials
    const encryptedCredentials = {};
    for (const [key, value] of Object.entries(mpesaConfig)) {
      encryptedCredentials[key] = encryptData(value);
    }

    // Check if M-PESA payment method already exists
    const existingMethod = await db.collection('paymentMethods').findOne({ code: 'mpesa' });

    if (existingMethod) {
      console.log('M-PESA payment method already exists. Updating credentials...');
      
      // Update existing payment method
      const result = await db.collection('paymentMethods').updateOne(
        { code: 'mpesa' },
        { 
          $set: { 
            name: 'M-PESA',
            description: 'Pay via M-PESA mobile money',
            isActive: true,
            credentials: encryptedCredentials,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`M-PESA payment method updated successfully! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } else {
      // Create new payment method
      const newPaymentMethod = {
        name: 'M-PESA',
        code: 'mpesa',
        icon: 'mpesa-logo',
        description: 'Pay via M-PESA mobile money',
        processingFee: 0,
        isActive: true,
        requiresRedirect: false,
        supportedCurrencies: ['KES'],
        credentials: encryptedCredentials,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('paymentMethods').insertOne(newPaymentMethod);
      console.log(`M-PESA payment method added successfully! ID: ${result.insertedId}`);
    }
    
  } catch (error) {
    console.error('Error adding M-PESA payment method:', error);
    process.exit(1);
  } finally {
    try {
      await client.close();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
}

// Execute the script and handle any uncaught errors
addMpesaPaymentMethod().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});