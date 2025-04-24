import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get query parameters
    const { status = 'pending', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create filter
    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    // Get applications with pagination
    const applications = await db.collection('djApplications')
      .find(filter)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const total = await db.collection('djApplications')
      .countDocuments(filter);

    res.status(200).json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching DJ applications:', error);
    res.status(500).json({ error: 'Failed to fetch DJ applications' });
  }
} 