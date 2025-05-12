import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // GET request - fetch settings
    if (req.method === 'GET') {
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(djId) },
        { projection: { 
          notificationPreferences: 1, 
          privacySettings: 1
        }}
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return default settings if not set
      const settings = {
        notificationPreferences: user.notificationPreferences || {
          email: true,
          push: true,
          sms: false,
          songRequests: true,
          earnings: true
        },
        privacySettings: user.privacySettings || {
          showPlayHistory: true,
          allowTagging: true,
          publicProfile: true,
          showEarnings: false
        }
      };
      
      return res.status(200).json({ settings });
    }
    
    // PUT request - update settings
    if (req.method === 'PUT') {
      const { notificationPreferences, privacySettings } = req.body;
      
      // Remove any fields that might cause conflicts
      const settingsToUpdate = {};
      
      if (notificationPreferences) {
        settingsToUpdate.notificationPreferences = notificationPreferences;
      }
      
      if (privacySettings) {
        settingsToUpdate.privacySettings = privacySettings;
      }
      
      // Add updatedAt timestamp
      settingsToUpdate.updatedAt = new Date();
      
      const updateResult = await db.collection('users').updateOne(
        { _id: new ObjectId(djId) },
        { $set: settingsToUpdate }
      );
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Settings updated successfully' 
      });
    }
  } catch (error) {
    console.error('Error handling settings request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 