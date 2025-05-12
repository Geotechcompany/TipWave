import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Get DJ's currency settings
    const settings = await db.collection('dj_settings').findOne({ djId });
    
    const defaultCurrency = settings?.currency || {
      code: 'USD',
      symbol: '$',
      rate: 1
    };

    res.status(200).json({ defaultCurrency });
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    res.status(500).json({ error: 'Failed to fetch currency settings' });
  }
} 