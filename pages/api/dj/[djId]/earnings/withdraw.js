import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get total available earnings
    const earnings = await db.collection('requests').aggregate([
      { 
        $match: { 
          djId: djId,
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
      djId: djId,
      amount: totalAmount,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null
    };

    const result = await db.collection('withdrawals').insertOne(withdrawal);

    // Mark requests as withdrawn
    await db.collection('requests').updateMany(
      { 
        djId: djId,
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