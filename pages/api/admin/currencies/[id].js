import { checkAdminAuth } from '../emails/auth-middleware';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Check admin authentication
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  const client = await clientPromise;
  const db = client.db();
  const currencies = db.collection('currencies');

  // PUT: Update a currency
  if (req.method === 'PUT') {
    try {
      const { symbol, name, rate, isActive } = req.body;
      
      // Validate required fields
      if (!symbol || !name || rate === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const updateData = {
        symbol,
        name,
        rate: Number(rate),
        isActive: Boolean(isActive),
        updatedAt: new Date()
      };
      
      const result = await currencies.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Currency not found' });
      }
      
      return res.status(200).json({ 
        message: 'Currency updated successfully'
      });
    } catch (error) {
      console.error('Error updating currency:', error);
      return res.status(500).json({ message: 'Failed to update currency', error: error.message });
    }
  }
  
  // DELETE: Delete a currency
  if (req.method === 'DELETE') {
    try {
      // First check if it's the default currency
      const currency = await currencies.findOne({ _id: new ObjectId(id) });
      
      if (currency?.isDefault) {
        return res.status(400).json({ 
          message: 'Cannot delete the default currency. Set another currency as default first.' 
        });
      }
      
      const result = await currencies.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Currency not found' });
      }
      
      return res.status(200).json({ message: 'Currency deleted successfully' });
    } catch (error) {
      console.error('Error deleting currency:', error);
      return res.status(500).json({ message: 'Failed to delete currency', error: error.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 