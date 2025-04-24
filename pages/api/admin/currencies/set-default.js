import { checkAdminAuth } from '../emails/auth-middleware';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Check admin authentication
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { currencyId } = req.body;
  if (!currencyId) {
    return res.status(400).json({ message: 'Currency ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const currencies = db.collection('currencies');

    // First, unset all currencies as default
    await currencies.updateMany(
      { isDefault: true },
      { $set: { isDefault: false, updatedAt: new Date() } }
    );

    // Then set the specified currency as default
    const result = await currencies.updateOne(
      { _id: new ObjectId(currencyId) },
      { $set: { isDefault: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    return res.status(200).json({ message: 'Default currency updated successfully' });
  } catch (error) {
    console.error('Error setting default currency:', error);
    return res.status(500).json({ message: 'Failed to set default currency', error: error.message });
  }
} 