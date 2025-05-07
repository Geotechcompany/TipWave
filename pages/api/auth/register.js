import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();

    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token valid for 24 hours

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toUpperCase(),
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
      balance: 0,
      active: true
    };

    const result = await db.collection('users').insertOne(newUser);

    // Create empty wallet for the user
    await db.collection('wallets').insertOne({
      userId: result.insertedId,
      balance: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send verification email using the correct function
    await sendNotificationEmail({
      to: email,
      type: EmailTypes.VERIFICATION,
      data: {
        name,
        token: verificationToken
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
} 