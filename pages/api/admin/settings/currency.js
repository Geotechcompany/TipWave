import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Get currency setting
    const setting = await db.collection('settings').findOne(
      { type: 'currency' },
      { projection: { currency: 1 } }
    );
    
    return res.status(200).json({ 
      currency: setting?.currency || 'USD'
    });
  } catch (error) {
    console.error('Error fetching currency setting:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch currency setting',
      details: error.message 
    });
  }
} 