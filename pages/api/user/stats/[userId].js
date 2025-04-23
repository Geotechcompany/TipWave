import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.query;
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Try to convert userId to ObjectId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Get basic user info with ObjectId
    const user = await db.collection('users').findOne(
      { _id: userObjectId },
      { projection: { password: 0 } } // Exclude sensitive data
    );

    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Log for debugging
    console.log(`Found user: ${user.name}, ID: ${userId}`);

    // Get recent activity
    const recentRequests = await db.collection('song_requests')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Calculate stats
    const stats = {
      totalRequests: await db.collection('song_requests').countDocuments({ userId: userId }),
      pendingRequests: await db.collection('song_requests').countDocuments({ 
        userId: userId,
        status: 'pending'
      }),
      completedRequests: await db.collection('song_requests').countDocuments({ 
        userId: userId, 
        status: 'completed' 
      }),
      favoriteDjs: await db.collection('favorites').countDocuments({ 
        userId: userId,
        type: 'dj'
      })
    };

    // Return user data with stats
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      stats: {
        accountCreated: user.createdAt || new Date(),
        lastActive: user.updatedAt || new Date(),
        ...stats
      },
      recentActivity: recentRequests
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
} 