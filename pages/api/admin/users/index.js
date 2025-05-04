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

  if (req.method === "GET") {
    try {
      // Get query parameters
      const { 
        page = 1, 
        limit = 6, 
        search = "", 
        type = "all", 
        sort = "newest" 
      } = req.query;
      
      // Convert to numbers
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Build query
      const client = await clientPromise;
      const db = client.db();
      
      // Base query
      let query = {};
      
      // Add search
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      // Add user type filter
      if (type !== "all") {
        switch (type) {
          case "admin":
            query.isAdmin = true;
            break;
          case "dj":
            query.role = "DJ";
            break;
          case "regular":
            query.isAdmin = { $ne: true };
            query.role = { $ne: "DJ" };
            break;
        }
      }
      
      // Build sort
      let sortOptions = {};
      switch (sort) {
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        case "alphabetical":
          sortOptions = { name: 1 };
          break;
        default: // newest
          sortOptions = { createdAt: -1 };
      }
      
      // Count total documents for pagination
      const total = await db.collection("users").countDocuments(query);
      
      // Fetch users
      const users = await db.collection("users")
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .toArray();
      
      // Format user data for the frontend
      const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name || "Unknown User",
        email: user.email || null,
        image: user.image || null,
        createdAt: user.createdAt || new Date(),
        isAdmin: user.isAdmin === true,
        role: user.role || "USER",
        status: user.status || (user.isActive !== false ? 'active' : 'inactive'),
        isActive: user.isActive !== false,
        isOnline: user.lastActive ? 
          (new Date() - new Date(user.lastActive)) < (5 * 60 * 1000) : false,
      }));
      
      return res.status(200).json({
        users: formattedUsers,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
} 