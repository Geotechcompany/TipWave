import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { djId, fanId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.body;

    if (!['regular', 'vip', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection('fans').updateOne(
      { _id: new ObjectId(fanId), djId: session.user.id },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating fan status:', error);
    res.status(500).json({ error: 'Failed to update fan status' });
  }
} 