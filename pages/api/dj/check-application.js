import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user already has an application
    const application = await db.collection('djApplications').findOne({
      userId: session.user.id
    });
    
    res.status(200).json({ 
      application: application || null
    });
  } catch (error) {
    console.error('Error checking DJ application status:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
} 