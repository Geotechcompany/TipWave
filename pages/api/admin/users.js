import { getAuth } from "@clerk/nextjs/server";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add admin role check here
  
  if (req.method === 'GET') {
    const { page = 1, limit = 10, search = '', filter = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    try {
      const users = await getCollection('users');
      
      // Build query
      let query = {};
      if (search) {
        query = { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ] 
        };
      }
      
      if (filter === 'dj') {
        query.role = 'DJ';
      } else if (filter === 'user') {
        query.role = 'USER';
      } else if (filter === 'active') {
        query.status = 'ACTIVE';
      } else if (filter === 'inactive') {
        query.status = 'INACTIVE';
      }
      
      // Get users with pagination
      const userData = await users.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();
      
      // Get total count for pagination
      const total = await users.countDocuments(query);
      
      res.status(200).json({
        users: userData,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, updates } = req.body;
      
      if (!id || !updates) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const users = await getCollection('users');
      
      // Only allow updating certain fields
      const allowedUpdates = {};
      if (updates.status) allowedUpdates.status = updates.status;
      if (updates.role) allowedUpdates.role = updates.role;
      
      // Add updatedAt timestamp
      allowedUpdates.updatedAt = new Date();
      
      const result = await users.updateOne(
        { _id: id },
        { $set: allowedUpdates }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error updating user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 