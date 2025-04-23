import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get total song requests count
    const totalRequests = await db.collection('song_requests')
      .countDocuments({ userId: session.user.id });

    // Get total amount spent
    const spendingAggregate = await db.collection('song_requests')
      .aggregate([
        { $match: { userId: session.user.id } },
        { $group: { 
          _id: null, 
          totalSpent: { $sum: '$amount' } 
        }}
      ]).toArray();
    
    const totalSpent = spendingAggregate.length > 0 ? spendingAggregate[0].totalSpent : 0;

    // Get favorite DJs (most requested)
    const favoriteDJs = await db.collection('song_requests')
      .aggregate([
        { $match: { userId: session.user.id } },
        { $group: { 
          _id: '$djId', 
          count: { $sum: 1 } 
        }},
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'djInfo'
        }},
        { $unwind: { path: '$djInfo', preserveNullAndEmptyArrays: true } },
        { $project: {
          _id: 1,
          djId: '$_id',
          djName: '$djInfo.name',
          djImage: '$djInfo.image',
          count: 1
        }}
      ]).toArray();

    // Get current month's tips
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTipsAggregate = await db.collection('song_requests')
      .aggregate([
        { 
          $match: { 
            userId: session.user.id,
            createdAt: { $gte: firstDayOfMonth }
          } 
        },
        { $group: { 
          _id: null, 
          monthlyTotal: { $sum: '$amount' } 
        }}
      ]).toArray();
    
    const tipsThisMonth = monthlyTipsAggregate.length > 0 ? monthlyTipsAggregate[0].monthlyTotal : 0;

    res.status(200).json({
      totalSpent,
      songsRequested: totalRequests,
      favoriteDJs: favoriteDJs.length,
      tipsThisMonth,
      favoriteDJsList: favoriteDJs
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
}