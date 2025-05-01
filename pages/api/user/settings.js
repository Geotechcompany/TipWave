import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    // Handle GET request - fetch user settings
    if (req.method === 'GET') {
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { 
          projection: { 
            darkMode: 1,
            emailNotifications: 1,
            pushNotifications: 1,
            soundEnabled: 1,
            language: 1,
            displayMode: 1,
            privacyMode: 1,
            preferredCurrency: 1
          } 
        }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json(user);
    }
    
    // Handle POST request - update user settings
    if (req.method === 'POST') {
      const { 
        darkMode,
        emailNotifications,
        pushNotifications,
        soundEnabled,
        language,
        displayMode,
        privacyMode, 
        preferredCurrency,
        ...otherSettings 
      } = req.body;
      
      // Validate currency if provided
      if (preferredCurrency) {
        // Validate the currency exists
        const currency = await db.collection('currencies').findOne({ code: preferredCurrency });
        
        if (!currency) {
          return res.status(400).json({ error: 'Invalid currency code' });
        }
      }
      
      // Update the user settings
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: { 
            darkMode,
            emailNotifications,
            pushNotifications,
            soundEnabled,
            language,
            displayMode,
            privacyMode,
            preferredCurrency,
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
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error with user settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
}