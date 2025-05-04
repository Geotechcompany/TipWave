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
    // PUT - Update payment method
    if (req.method === 'PUT') {
      const { 
        name, 
        code, 
        icon, 
        description, 
        processingFee, 
        isActive, 
        requiresRedirect,
        supportedCurrencies,
        credentials
      } = req.body;
      
      const updatedMethod = {
        ...(name && { name }),
        ...(code && { code }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(processingFee !== undefined && { processingFee }),
        ...(isActive !== undefined && { isActive }),
        ...(requiresRedirect !== undefined && { requiresRedirect }),
        ...(supportedCurrencies && { supportedCurrencies }),
        ...(credentials && { credentials }),
        updatedAt: new Date()
      };
      
      const result = await db.collection('paymentMethods').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedMethod }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Payment method updated successfully'
      });
    }
    
    // DELETE - Remove payment method
    else if (req.method === 'DELETE') {
      const result = await db.collection('paymentMethods').deleteOne(
        { _id: new ObjectId(id) }
      );
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    }
    
    // GET - Fetch single payment method
    else if (req.method === 'GET') {
      const method = await db.collection('paymentMethods').findOne(
        { _id: new ObjectId(id) }
      );
      
      if (!method) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      return res.status(200).json({ paymentMethod: method });
    }
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error handling payment method ${req.method} request:`, error);
    return res.status(500).json({ error: `Failed to ${req.method.toLowerCase()} payment method` });
  }
} 