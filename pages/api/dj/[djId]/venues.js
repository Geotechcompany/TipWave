import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Check authentication for both GET and POST methods
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET requests
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db();

      const [venues, stats] = await Promise.all([
        db.collection('venues')
          .find({ djId: session.user.id })
          .sort({ name: 1 })
          .toArray(),
        db.collection('venues').aggregate([
          { $match: { djId: session.user.id } },
          {
            $group: {
              _id: null,
              totalVenues: { $sum: 1 },
              favoriteVenues: {
                $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
              }
            }
          }
        ]).toArray(),
        db.collection('events').countDocuments({
          djId: session.user.id,
          date: { $gte: new Date() }
        })
      ]);

      res.status(200).json({
        venues,
        stats: {
          totalVenues: stats[0]?.totalVenues || 0,
          favoriteVenues: stats[0]?.favoriteVenues || 0,
          upcomingEvents: stats[2] || 0
        }
      });
    } catch (error) {
      console.error('Error fetching venues:', error);
      res.status(500).json({ error: 'Failed to fetch venues' });
    }
  }
  // Handle POST requests
  else if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db();

      const venueData = {
        ...req.body,
        djId: session.user.id,
        createdAt: new Date(),
        isFavorite: false,
        upcomingEvents: 0
      };

      const result = await db.collection('venues').insertOne(venueData);

      res.status(201).json({ 
        success: true, 
        venueId: result.insertedId,
        message: 'Venue created successfully'
      });
    } catch (error) {
      console.error('Error creating venue:', error);
      res.status(500).json({ error: 'Failed to create venue' });
    }
  }
  // Handle other methods
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 