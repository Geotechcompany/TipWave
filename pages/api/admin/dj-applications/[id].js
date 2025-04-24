import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

export default async function handler(req, res) {
  // Only allow PUT for updating application status
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    const { id } = req.query;
    const { status, adminNotes } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find and update the application
    const application = await db.collection('djApplications').findOne({
      _id: new ObjectId(id)
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application is already processed' });
    }

    // Update application status
    await db.collection('djApplications').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          adminNotes: adminNotes || '',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // If approved, update user role to DJ
    if (status === 'approved') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(application.userId) },
        { $set: { 
            role: 'DJ',
            updatedAt: new Date()
          } 
        }
      );

      await sendNotificationEmail(EmailTypes.DJ_APPLICATION_APPROVED, application.email, {
        userName: application.name || application.email.split('@')[0]
      });
    } else if (status === 'rejected') {
      await sendNotificationEmail(EmailTypes.DJ_APPLICATION_REJECTED, application.email, {
        userName: application.name || application.email.split('@')[0]
      });
    }

    res.status(200).json({
      success: true,
      message: `DJ application ${status}`
    });
  } catch (error) {
    console.error('Error processing DJ application:', error);
    res.status(500).json({ error: 'Failed to process DJ application' });
  }
} 