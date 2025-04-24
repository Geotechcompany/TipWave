import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

  if (req.method === 'GET') {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      filter = 'all', 
      sort = 'newest' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    try {
      const client = await clientPromise;
      const db = client.db();
      
      // Build query
      let query = {};
      
      // Filter by status if not "all"
      if (filter && filter !== 'all') {
        query.status = filter.toLowerCase();
      }
      
      // Search functionality
      if (search) {
        const songRequests = db.collection("song_requests");
        const songs = db.collection("songs");
        const users = db.collection("users");
        
        // Find songs matching search term
        const matchingSongs = await songs.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { artist: { $regex: search, $options: 'i' } }
          ]
        }).toArray();
        
        // Find users matching search term
        const matchingUsers = await users.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).toArray();
        
        // Create arrays of IDs
        const songIds = matchingSongs.map(song => song._id);
        const userIds = matchingUsers.map(user => user._id);
        
        // Add to query conditions
        query.$or = [];
        
        if (songIds.length > 0) {
          query.$or.push({ songId: { $in: songIds } });
        }
        
        if (userIds.length > 0) {
          query.$or.push({ userId: { $in: userIds } });
        }
        
        // If no matches, add impossible condition to return no results
        if (query.$or.length === 0) {
          query.$or.push({ _id: null });
        }
      }
      
      // Determine sort order
      let sortOptions = {};
      switch (sort) {
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'highest':
          sortOptions = { amount: -1 };
          break;
        case 'lowest':
          sortOptions = { amount: 1 };
          break;
        default: // newest
          sortOptions = { createdAt: -1 };
      }
      
      // Count total matching documents for pagination
      const total = await db.collection("song_requests").countDocuments(query);
      
      // Build aggregation pipeline
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "songs",
            localField: "songId",
            foreignField: "_id",
            as: "song"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$song", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            notes: 1,
            song: {
              _id: "$song._id",
              title: "$song.title",
              artist: "$song.artist",
              albumArt: "$song.albumArt"
            },
            user: {
              _id: "$user._id",
              name: "$user.name",
              email: "$user.email",
              image: "$user.image"
            }
          }
        }
      ];
      
      // Execute pipeline
      const bids = await db.collection("song_requests").aggregate(pipeline).toArray();
      
      return res.status(200).json({
        bids,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      });
      
    } catch (error) {
      console.error("Error fetching bids:", error);
      return res.status(500).json({ error: "Failed to fetch bids" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
} 