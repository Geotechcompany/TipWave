import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Get the session
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Handle PUT request to update user
    if (req.method === 'PUT') {
      const { name, email, role, status } = req.body;
      
      const updatedUser = {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedUser }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'User updated successfully'
      });
    }
    
    // Handle DELETE request to delete user
    if (req.method === 'DELETE') {
      // Prevent admin from deleting themselves
      if (id === session.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }
      
      // Delete the user
      const result = await db.collection('users').deleteOne({
        _id: new ObjectId(id)
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully'
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 