import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get total available earnings
    const earnings = await db.collection('requests').aggregate([
      { 
        $match: { 
          djId: userId,
          status: 'completed',
          isWithdrawn: { $ne: true }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

    const totalAmount = earnings[0]?.total || 0;

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'No earnings available to withdraw' });
    }

    // Create withdrawal record
    const withdrawal = {
      djId: userId,
      amount: totalAmount,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null
    };

    const result = await db.collection('withdrawals').insertOne(withdrawal);

    // Mark requests as withdrawn
    await db.collection('requests').updateMany(
      { 
        djId: userId,
        status: 'completed',
        isWithdrawn: { $ne: true }
      },
      { 
        $set: { 
          isWithdrawn: true,
          withdrawalId: result.insertedId
        }
      }
    );

    // Here you would typically integrate with a payment processor
    // For now, we'll just simulate the withdrawal

    // Update withdrawal status
    await db.collection('withdrawals').updateOne(
      { _id: result.insertedId },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date()
        }
      }
    );

    res.status(200).json({ 
      success: true,
      withdrawalId: result.insertedId,
      amount: totalAmount
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
} 