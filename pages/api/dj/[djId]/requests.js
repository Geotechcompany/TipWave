import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

// Helper function to fetch requests from both collections
const fetchRequests = async (db, djId, status) => {
  let requests = [];
  
  // Try song_requests collection
  const songRequests = await db.collection('song_requests')
    .find({
      djId: djId,
      ...(status && { status: status })
    })
    .sort({ createdAt: -1 })
    .toArray();
  
  requests = [...requests, ...songRequests];
  
  // Try requests collection
  const otherRequests = await db.collection('requests')
    .find({
      djId: djId,
      ...(status && { status: status })
    })
    .sort({ createdAt: -1 })
    .toArray();
  
  requests = [...requests, ...otherRequests];
  
  return requests;
};

// API Route Handler
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
    const status = req.query.status || 'pending';

    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const client = await clientPromise;
    const db = client.db();

    const requests = await fetchRequests(db, djId, status);
    return res.status(200).json(requests);

  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }
} 