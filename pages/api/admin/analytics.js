import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  // Check admin privileges
  if (!session) {
    return res.status(401).json({ error: "Unauthorized - No session" });
  }
  
  const isAdmin = 
    session.user.isAdmin === true || 
    session.user.role === "admin" || 
    session.user.role === "ADMIN" ||
    (session.user.permissions && session.user.permissions.includes("admin"));
  
  if (!isAdmin) {
    return res.status(401).json({ error: "Unauthorized - Not an admin" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { timeRange = 'week' } = req.query;
    
    const client = await clientPromise;
    const db = client.db();
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }
    
    // Revenue data
    const revenuePipeline = [
      {
        $match: {
          status: { $in: ["approved", "completed"] },
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1
        }
      }
    ];
    
    // User growth data
    const userPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      }
    ];
    
    // Bid activity data
    const bidPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
          avgAmount: { $round: [{ $divide: ["$totalAmount", "$count"] }, 2] }
        }
      }
    ];
    
    // Bid status distribution
    const bidStatusPipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1
        }
      }
    ];
    
    // Execute all aggregations
    const [revenue, userGrowth, bidActivity, bidStatusDist] = await Promise.all([
      db.collection("song_requests").aggregate(revenuePipeline).toArray(),
      db.collection("users").aggregate(userPipeline).toArray(),
      db.collection("song_requests").aggregate(bidPipeline).toArray(),
      db.collection("song_requests").aggregate(bidStatusPipeline).toArray()
    ]);
    
    // Add cumulative user count
    let cumulativeCount = 0;
    const userGrowthWithCumulative = userGrowth.map(day => {
      cumulativeCount += day.count;
      return {
        ...day,
        cumulative: cumulativeCount
      };
    });
    
    // Return the full analytics data
    return res.status(200).json({
      timeRange,
      revenue,
      users: userGrowthWithCumulative,
      bids: bidActivity,
      bidsByStatus: bidStatusDist
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return res.status(500).json({ error: "Failed to fetch analytics data" });
  }
} 