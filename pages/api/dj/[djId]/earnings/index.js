import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const timeframe = req.query.timeframe || 'month';
    
    const client = await clientPromise;
    const db = client.db();
    
    // Determine date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get transactions for the DJ
    const transactions = await db.collection('transactions')
      .find({
        userId: new ObjectId(djId),
        type: { $in: ['income', 'payment'] },
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get song request transactions specifically
    const songRequestTransactions = transactions.filter(tx => 
      tx.description && tx.description.includes('song request')
    );
    
    // Calculate total earnings
    const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const songRequestEarnings = songRequestTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    // Group transactions by month for trends
    const monthlyEarnings = months.map((month, index) => {
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getMonth() === index;
      });
      
      return {
        month,
        amount: monthTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
      };
    });
    
    // Get recent completed song requests with requester information
    const recentRequests = await db.collection('song_requests')
      .aggregate([
        {
          $match: {
            djId: djId,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'requester'
          }
        },
        {
          $unwind: {
            path: '$requester',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            songTitle: 1,
            songArtist: 1,
            amount: 1,
            createdAt: 1,
            requesterName: '$requester.name',
            requesterEmail: '$requester.email'
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 10
        }
      ])
      .toArray();
    
    // Combine transactions with song request info for a complete view
    const enrichedTransactions = [
      ...transactions.slice(0, 20).map(tx => ({
        ...tx,
        _id: tx._id.toString()
      }))
    ];
    
    // Calculate trends
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(now.getMonth() - 1);
    
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(now.getDate() - 7);
    
    // Current period earnings
    const currentMonthEarnings = transactions
      .filter(tx => new Date(tx.createdAt) >= lastMonthDate)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    const currentWeekEarnings = transactions
      .filter(tx => new Date(tx.createdAt) >= lastWeekDate)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    // Previous period
    const twoMonthsAgoDate = new Date(lastMonthDate);
    twoMonthsAgoDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const twoWeeksAgoDate = new Date(lastWeekDate);
    twoWeeksAgoDate.setDate(lastWeekDate.getDate() - 7);
    
    const previousMonthEarnings = transactions
      .filter(tx => new Date(tx.createdAt) >= twoMonthsAgoDate && new Date(tx.createdAt) < lastMonthDate)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    const previousWeekEarnings = transactions
      .filter(tx => new Date(tx.createdAt) >= twoWeeksAgoDate && new Date(tx.createdAt) < lastWeekDate)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    // Calculate percentage change
    const monthlyTrend = previousMonthEarnings === 0 
      ? 100 
      : Math.round((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings * 100);
    
    const weeklyTrend = previousWeekEarnings === 0 
      ? 100 
      : Math.round((currentWeekEarnings - previousWeekEarnings) / previousWeekEarnings * 100);
    
    res.status(200).json({
      total,
      songRequestEarnings,
      totalCompletedRequests: recentRequests.length,
      monthly: monthlyEarnings,
      recentTransactions: enrichedTransactions,
      trends: {
        weekly: weeklyTrend,
        monthly: monthlyTrend
      }
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
} 