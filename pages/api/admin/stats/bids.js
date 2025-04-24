import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Aggregate bid status counts from the database
    const bidStatusAggregation = await db.collection("song_requests").aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Format the results into the expected structure
    // Default to 0 for each status category
    const bidsByStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };
    
    // Update the counts from the aggregation results
    bidStatusAggregation.forEach(item => {
      const status = item._id ? item._id.toLowerCase() : "pending";
      if (bidsByStatus.hasOwnProperty(status)) {
        bidsByStatus[status] = item.count;
      }
    });
    
    // Return the aggregated data
    return res.status(200).json({
      bidsByStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching bid statistics:", error);
    return res.status(500).json({ error: "Failed to fetch bid statistics" });
  }
} 