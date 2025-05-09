import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
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

  if (req.method === 'GET') {
    try {
      const settings = await db.collection('dj_settings').findOne({ djId: djId });
      
      // Return default settings if none exist
      res.status(200).json({
        settings: settings || {
          notifications: {
            email: true,
            push: true,
            songRequests: true,
            events: true
          },
          appearance: {
            theme: "dark",
            fontSize: "normal"
          },
          privacy: {
            profileVisibility: "public",
            showEarnings: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      await db.collection('dj_settings').updateOne(
        { djId: djId },
        { 
          $set: { 
            ...req.body,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 