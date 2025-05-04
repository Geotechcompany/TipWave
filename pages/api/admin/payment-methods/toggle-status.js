import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { methodId, isActive } = req.body;
    
    if (!methodId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment method ID is required' 
      });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Update the payment method status
    const result = await db.collection('paymentMethods').updateOne(
      { _id: new ObjectId(methodId) },
      { 
        $set: {
          isActive: !!isActive,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Payment method ${isActive ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating payment method status:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update payment method status',
      details: error.message 
    });
  }
} 