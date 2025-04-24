import { generateDefaultAvatar } from '@/lib/avatar';
import { hashPassword } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate avatar
    const profilePicture = generateDefaultAvatar({ name, email });

    // Create the user
    const hashedPassword = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      profilePicture,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    console.log(`User registered with ID: ${result.insertedId}`);

    // Exclude password from response
    // eslint-disable-next-line no-unused-vars
    const { _id, password: _, ...userWithoutSensitiveInfo } = newUser;

    res.status(201).json({
      user: userWithoutSensitiveInfo,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
} 