import { getSession } from "next-auth/react";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    // Fetch email logs for this specific user
    const logs = await db.collection('emailLogs')
      .find({ userId: userId })
      .sort({ sentAt: -1 })
      .limit(10)
      .toArray();

    // Count statistics
    const stats = {
      sent: await db.collection('emailLogs').countDocuments({ 
        userId: userId 
      }),
      delivered: await db.collection('emailLogs').countDocuments({ 
        userId: userId, 
        status: 'delivered' 
      }),
      failed: await db.collection('emailLogs').countDocuments({ 
        userId: userId, 
        status: 'failed' 
      })
    };

    return res.status(200).json({ 
      logs: logs.map(log => ({
        ...log,
        _id: log._id.toString()
      })),
      stats 
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ error: 'Failed to fetch email logs' });
  }
} 