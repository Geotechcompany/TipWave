import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // In a real implementation, you would delete from database and cancel the scheduled job
      
      return res.status(200).json({ message: 'Scheduled email cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling scheduled email:', error);
      return res.status(500).json({ message: 'Failed to cancel scheduled email', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 