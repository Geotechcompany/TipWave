import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { preferredCurrency, ...otherSettings } = req.body;
    
    // Check if the currency is valid (in a production app, validate against DB)
    if (preferredCurrency) {
      const client = await clientPromise;
      const db = client.db();
      
      // Validate the currency exists
      const currency = await db.collection('currencies').findOne({ code: preferredCurrency });
      
      if (!currency) {
        return res.status(400).json({ error: 'Invalid currency code' });
      }
      
      // Update the user's preferred currency
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: { 
            preferredCurrency,
            ...otherSettings,
            updatedAt: new Date()
          }
        }
      );
      
      return res.status(200).json({ 
        success: true, 
        message: 'Settings updated successfully',
        currency: currency
      });
    } else {
      // Handle other settings updates if needed
      const client = await clientPromise;
      const db = client.db();
      
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: { 
            ...otherSettings,
            updatedAt: new Date()
          }
        }
      );
      
      return res.status(200).json({ 
        success: true, 
        message: 'Settings updated successfully'
      });
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}