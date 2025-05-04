import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const { name, email, password, role = 'USER' } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user
    const newUser = {
      name,
      email,
      role,
      status: 'active', // Set explicit status
      isActive: true,    // Set isActive flag for backwards compatibility
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add password if provided (you should hash this in production)
    if (password) {
      // In a real application, you would hash the password
      newUser.password = password;
    }
    
    const result = await db.collection('users').insertOne(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
} 