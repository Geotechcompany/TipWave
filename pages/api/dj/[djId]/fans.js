import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
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

    const { djId } = req.query;
    if (djId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { filter = 'all', sort = 'lastActive' } = req.query;
    const client = await clientPromise;
    const db = client.db();

    // Base query for fans
    let query = { djId: djId };
    
    // Apply filters
    if (filter === 'vip') {
      query.status = 'vip';
    } else if (filter === 'blocked') {
      query.status = 'blocked';
    } else if (filter === 'tipped') {
      // We'll handle this with an aggregation pipeline
    } else if (filter === 'requested') {
      // We'll handle this separately
    }

    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'totalSpent':
        sortOptions = { totalSpent: -1 };
        break;
      case 'totalRequests':
        sortOptions = { totalRequests: -1 };
        break;
      case 'totalTips':
        sortOptions = { totalTips: -1 };
        break;
      case 'lastActive':
      default:
        sortOptions = { lastActive: -1 };
    }

    // Get song requests for this DJ
    const songRequests = await db.collection('song_requests')
      .find({ djId: djId })
      .toArray();
    
    // Get unique user IDs who have made requests
    const requestUserIds = [...new Set(songRequests.map(req => req.userId))];
    
    // Calculate request stats per user
    const requestStats = {};
    songRequests.forEach(req => {
      if (!requestStats[req.userId]) {
        requestStats[req.userId] = {
          count: 0,
          totalSpent: 0,
          lastRequest: null
        };
      }
      
      requestStats[req.userId].count++;
      requestStats[req.userId].totalSpent += parseFloat(req.amount || 0);
      
      const requestDate = new Date(req.createdAt || req.timestamp || 0);
      if (!requestStats[req.userId].lastRequest || 
          requestDate > new Date(requestStats[req.userId].lastRequest)) {
        requestStats[req.userId].lastRequest = req.createdAt || req.timestamp;
      }
    });

    // Get tips for this DJ
    const tips = await db.collection('transactions')
      .find({ 
        recipientId: djId, 
        type: 'tip' 
      })
      .toArray();
    
    // Get unique user IDs who have tipped
    const tipUserIds = [...new Set(tips.map(tip => tip.userId))];
    
    // Calculate tip stats per user
    const tipStats = {};
    tips.forEach(tip => {
      if (!tipStats[tip.userId]) {
        tipStats[tip.userId] = {
          count: 0,
          totalTips: 0
        };
      }
      
      tipStats[tip.userId].count++;
      tipStats[tip.userId].totalTips += parseFloat(tip.amount || 0);
    });

    // Get fans based on filter
    let fans = [];
    if (filter === 'tipped') {
      // Get fan records for users who have tipped
      if (tipUserIds.length > 0) {
        fans = await db.collection('fans')
          .find({ 
            djId: djId,
            userId: { $in: tipUserIds }
          })
          .sort(sortOptions)
          .toArray();
      }
    } else if (filter === 'requested') {
      // Get fan records for users who have made requests
      if (requestUserIds.length > 0) {
        fans = await db.collection('fans')
          .find({ 
            djId: djId,
            userId: { $in: requestUserIds }
          })
          .sort(sortOptions)
          .toArray();
      }
    } else {
      // Regular fan query
      fans = await db.collection('fans')
        .find(query)
        .sort(sortOptions)
        .toArray();
    }
    
    // Enrich fan data with request and tip information
    fans = fans.map(fan => {
      const userId = fan.userId;
      const userRequestStats = requestStats[userId] || { count: 0, totalSpent: 0, lastRequest: null };
      const userTipStats = tipStats[userId] || { count: 0, totalTips: 0 };
      
      return {
        ...fan,
        totalRequests: userRequestStats.count,
        totalSpent: userRequestStats.totalSpent,
        lastRequest: userRequestStats.lastRequest,
        tipCount: userTipStats.count,
        totalTips: userTipStats.totalTips,
        // If we don't have lastActive from the fan record, use the last request date
        lastActive: fan.lastActive || userRequestStats.lastRequest
      };
    });

    // Get accepted song requests
    const acceptedRequests = songRequests.filter(req => req.status === 'accepted');
    
    // Calculate top fans based on accepted requests
    const topFansData = {};
    acceptedRequests.forEach(req => {
      if (!topFansData[req.userId]) {
        topFansData[req.userId] = {
          userId: req.userId,
          acceptedRequests: 0,
          totalSpent: 0
        };
      }
      topFansData[req.userId].acceptedRequests++;
      topFansData[req.userId].totalSpent += parseFloat(req.amount || 0);
    });

    // Get top 6 fans by accepted requests
    const topFanIds = Object.values(topFansData)
      .sort((a, b) => b.acceptedRequests - a.acceptedRequests)
      .slice(0, 6)
      .map(fan => fan.userId);

    // Fetch full fan details for top fans
    const topFans = topFanIds.length > 0 
      ? await db.collection('fans')
          .find({ 
            djId, 
            userId: { $in: topFanIds } 
          })
          .toArray()
      : [];

    // Enrich top fans with request data
    const enrichedTopFans = topFans.map(fan => ({
      ...fan,
      acceptedRequests: topFansData[fan.userId].acceptedRequests,
      totalSpent: topFansData[fan.userId].totalSpent
    }));

    // Get stats
    const [statsResult, tipsStats] = await Promise.all([
      db.collection('fans').aggregate([
        { $match: { djId: djId } },
        {
          $group: {
            _id: null,
            totalFans: { $sum: 1 },
            vipFans: {
              $sum: {
                $cond: [{ $eq: ['$status', 'vip'] }, 1, 0]
              }
            },
            activeToday: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$lastActive',
                      new Date(new Date().setHours(0, 0, 0, 0))
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),
      
      // Get tipping stats
      db.collection('transactions').aggregate([
        { 
          $match: { 
            recipientId: djId,
            type: 'tip'
          } 
        },
        {
          $group: {
            _id: null,
            tippedFans: { $addToSet: '$userId' },
            totalTipsReceived: { $sum: { $toDouble: '$amount' } }
          }
        }
      ]).toArray()
    ]);

    // Calculate request stats
    const requestsStats = {
      totalRequests: songRequests.length,
      requestingFans: requestUserIds.length,
      totalRequestRevenue: songRequests.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0)
    };

    const stats = {
      ...(statsResult[0] || {
        totalFans: 0,
        vipFans: 0,
        activeToday: 0
      }),
      tippedFans: tipsStats[0]?.tippedFans?.length || 0,
      totalTipsReceived: tipsStats[0]?.totalTipsReceived || 0,
      ...requestsStats
    };

    res.status(200).json({
      fans,
      stats,
      topFans: enrichedTopFans
    });
  } catch (error) {
    console.error('Error fetching fans:', error);
    res.status(500).json({ error: 'Failed to fetch fans' });
  }
} 