import { connectToDatabase } from '../db';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function createUser({ email, password, name, role }) {
  try {
    const { db } = await connectToDatabase();
    
    const newUser = {
      _id: new ObjectId(),
      email,
      password: await bcrypt.hash(password, 10),
      name: name || 'Anonymous',
      role: role || 'USER',
      createdAt: new Date()
    };

    await db.collection('users').insertOne(newUser);
    
    return {
      ...newUser,
      id: newUser._id.toString()
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) return null;

    // Log the found user (without sensitive data)
    console.log("Found user in DB:", {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    return {
      ...user,
      id: user._id.toString(),
      _id: user._id
    };
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

export async function findUserById(userId) {
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ 
      _id: typeof userId === 'string' ? new ObjectId(userId) : userId 
    });
    
    if (!user) return null;

    return {
      ...user,
      id: user._id.toString(),
      _id: user._id
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
} 