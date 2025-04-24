import { checkAdminAuth } from './auth-middleware';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status || null;
    
    // Build query object
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Fetch email logs from database with pagination
    const logs = await db.collection('email_logs')
      .find(query)
      .sort({ sentAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count for pagination
    const totalCount = await db.collection('email_logs').countDocuments(query);
    
    return res.status(200).json({ 
      logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ message: 'Failed to fetch email logs', error: error.message });
  }
} 