import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Get wallet by user ID from the database
 * @param {string} userId - The user ID to fetch wallet for
 * @returns {Promise<{userId: string, balance: number}|null>} Wallet object or null
 */
export async function getWalletByUserId(userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(userId);
    
    // First try finding in wallets collection
    const wallet = await db.collection('wallets').findOne({ 
      userId: objectId 
    });
    
    if (wallet) {
      return wallet;
    }
    
    // If not found in wallets, check users collection
    const user = await db.collection('users').findOne({ 
      _id: objectId 
    });
    
    if (user && typeof user.wallet === 'number') {
      // Return in wallet format for consistency
      return {
        userId: objectId,
        balance: user.wallet,
        source: 'users'
      };
    }
    
    // Return null if no wallet found
    return null;
  } catch (error) {
    console.error('Error in getWalletByUserId:', error);
    return null;
  }
} 