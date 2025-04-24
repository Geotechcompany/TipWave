import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Users with DJ role can't apply again
    if (['DJ', 'ADMIN', 'BOTH'].includes(session.user.role)) {
      return res.status(400).json({ error: 'You already have DJ privileges' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if already applied
    const existingApplication = await db.collection('djApplications').findOne({
      userId: session.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        error: existingApplication.status === 'pending' 
          ? 'You already have a pending application' 
          : 'Your application was already approved'
      });
    }

    const { experience, equipment, genres, socialLinks, motivation } = req.body;

    // Basic validation
    if (!experience || !motivation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const application = {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      experience,
      equipment,
      genres: genres || [],
      socialLinks: socialLinks || {},
      motivation,
      status: 'pending',
      appliedAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('djApplications').insertOne(application);

    res.status(201).json({
      success: true,
      message: 'DJ application submitted successfully'
    });
  } catch (error) {
    console.error('DJ application error:', error);
    res.status(500).json({ error: 'Failed to submit DJ application' });
  }
} 