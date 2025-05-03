import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'DJ IDs are required' });
    }
    
    // Parse the comma-separated list of DJ IDs
    const djIds = ids.split(',').filter(Boolean);
    
    // Convert string IDs to ObjectId
    const objectIds = djIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.error(`Invalid ObjectId: ${id}`);
        return null;
      }
    }).filter(Boolean);
    
    if (objectIds.length === 0) {
      return res.status(200).json({ djs: [] });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch DJs
    const djs = await db.collection('users').find({
      _id: { $in: objectIds }
    }).project({
      _id: 1,
      name: 1, 
      username: 1,
      email: 1,
      image: 1
    }).toArray();
    
    // Format _id to string
    const formattedDjs = djs.map(dj => ({
      ...dj,
      _id: dj._id.toString()
    }));
    
    return res.status(200).json({
      success: true,
      djs: formattedDjs
    });
  } catch (error) {
    console.error('Error fetching DJ information:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch DJ information',
      details: error.message 
    });
  }
}