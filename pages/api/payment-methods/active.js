import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Find all active payment methods, but don't return credentials
    const paymentMethods = await db.collection('paymentMethods')
      .find({ isActive: true })
      .project({ 
        credentials: 0 // Exclude sensitive credentials
      })
      .toArray();
    
    return res.status(200).json({ 
      success: true,
      paymentMethods 
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch payment methods' 
    });
  }
} 