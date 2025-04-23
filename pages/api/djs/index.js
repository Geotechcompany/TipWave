import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Query parameters
    const { limit = 50, skip = 0, search = '', sort = 'name' } = req.query;
    
    // Build the query
    const query = { role: 'DJ' };
    
    // Add search functionality if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    const sortOptions = {};
    if (sort === 'recent') {
      sortOptions.createdAt = -1;
    } else if (sort === 'popular') {
      sortOptions.followerCount = -1;
    } else {
      sortOptions.name = 1; // Default sort by name
    }

    // Execute the query
    const djs = await db.collection('users')
      .find(query)
      .sort(sortOptions)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .project({
        password: 0, // Exclude sensitive data
        resetToken: 0,
        resetTokenExpiry: 0
      })
      .toArray();

    // Get total count for pagination
    const total = await db.collection('users').countDocuments(query);

    // Return the results
    res.status(200).json({
      djs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + djs.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching DJs:', error);
    res.status(500).json({ error: 'Failed to fetch DJs' });
  }
} 