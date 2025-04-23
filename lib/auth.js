import { getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { randomBytes } from 'crypto';
import { connectToDatabase } from './db';
import { generateDefaultAvatar } from '@/lib/avatar';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const requireAuth = async (req, res) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  return !!session;
};

export async function generateResetToken(userId) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  const { db } = await connectToDatabase();
  
  await db.collection('passwordResets').insertOne({
    userId,
    token,
    expires,
    createdAt: new Date()
  });

  return token;
}

export async function validateResetToken(token) {
  const { db } = await connectToDatabase();
  
  const resetRequest = await db.collection('passwordResets').findOne({
    token,
    expires: { $gt: new Date() }
  });

  if (!resetRequest) {
    throw new Error('Invalid or expired reset token');
  }

  return resetRequest.userId;
}

// Create an extended version of the original authOptions with avatar generation
export const extendedAuthOptions = {
  ...nextAuthOptions,
  callbacks: {
    ...nextAuthOptions.callbacks,
    async signIn({ user, account, profile }) {
      // Call the original signIn callback if it exists
      if (nextAuthOptions.callbacks?.signIn) {
        const result = await nextAuthOptions.callbacks.signIn({ user, account, profile });
        if (result === false) return false;
      }

      // For OAuth providers, check if user needs an avatar
      if (account.provider === 'google' || account.provider === 'github') {
        // These providers already have avatars, so we don't need to generate one
        return true;
      }
      
      // For email/password, we might need to generate an avatar
      if (account.provider === 'credentials' && !user.image) {
        const avatar = generateDefaultAvatar({ name: user.name, email: user.email });
        
        // Update user with avatar in database
        const client = await clientPromise;
        const db = client.db();
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { image: avatar } }
        );
        
        // Add image to the user object for this session
        user.image = avatar;
      }
      
      return true;
    },
    // Preserve other callbacks from original authOptions
  }
};

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hashed password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare a password with a hash
 * @param {string} password - The password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} Whether the password matches
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};