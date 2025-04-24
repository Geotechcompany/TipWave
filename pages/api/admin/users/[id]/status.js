import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Prevent admin from deactivating themselves
    if (id === session.user.id && status === 'inactive') {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    // Update user status
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
} 