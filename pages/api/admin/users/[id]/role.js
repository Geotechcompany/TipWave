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
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    // Validate role
    const validRoles = ['USER', 'DJ', 'ADMIN', 'BOTH'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Prevent admin from changing their own role
    if (id === session.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    
    // Update user role
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
} 