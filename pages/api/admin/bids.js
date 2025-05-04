import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const { 
      page = 1, 
      limit = 10, 
      search = "",
      filter = "all",
      sort = "newest" 
    } = req.query;

    const client = await clientPromise;
    const db = client.db();

    // Build the filter query
    const query = {};
    if (filter !== "all") {
      query.status = filter;
    }

    // Add search functionality
    if (search) {
      // Use aggregate with $lookup to join song and user data for searching
      const bids = await db.collection('song_requests').aggregate([
        {
          $addFields: {
            // Convert string IDs to ObjectIds for proper lookup with error handling
            songIdObj: { 
              $cond: { 
                if: { 
                  $and: [
                    { $eq: [{ $type: "$songId" }, "string"] },
                    { $eq: [{ $strLenCP: "$songId" }, 24] }  // Check if it's valid ObjectId length
                  ]
                },
                then: { 
                  $convert: {
                    input: "$songId",
                    to: "objectId",
                    onError: "$songId"  // Keep original on error
                  }
                },
                else: "$songId"
              }
            },
            userIdObj: { 
              $cond: { 
                if: { 
                  $and: [
                    { $eq: [{ $type: "$userId" }, "string"] },
                    { $eq: [{ $strLenCP: "$userId" }, 24] }  // Check if it's valid ObjectId length
                  ]
                },
                then: { 
                  $convert: {
                    input: "$userId",
                    to: "objectId",
                    onError: "$userId"  // Keep original on error
                  }
                },
                else: "$userId"
              }
            }
          }
        },
        {
          $lookup: {
            from: "songs",
            localField: "songIdObj",
            foreignField: "_id",
            as: "songData"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userIdObj",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $unwind: { path: "$songData", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$userData", preserveNullAndEmptyArrays: true }
        },
        {
          $match: {
            $or: [
              { "songData.title": { $regex: search, $options: "i" } },
              { "songData.artist": { $regex: search, $options: "i" } },
              { "userData.name": { $regex: search, $options: "i" } },
              { "userData.email": { $regex: search, $options: "i" } }
            ]
          }
        }
      ]).toArray();

      return res.status(200).json({
        bids: bids.map(bid => ({
          ...bid,
          _id: bid._id.toString(),
          songId: bid.songId?.toString(),
          userId: bid.userId?.toString(),
          song: bid.songData,
          user: bid.userData
        })),
        pagination: {
          total: bids.length,
          pages: Math.ceil(bids.length / parseInt(limit))
        }
      });
    }

    // Regular query without search
    const totalCount = await db.collection('song_requests').countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { amount: -1 };
        break;
      case "lowest":
        sortOption = { amount: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Fetch and join the data
    const bids = await db.collection('song_requests')
      .aggregate([
        { $match: query },
        {
          $addFields: {
            // Convert string IDs to ObjectIds for proper lookup with error handling
            songIdObj: { 
              $cond: { 
                if: { 
                  $and: [
                    { $eq: [{ $type: "$songId" }, "string"] },
                    { $eq: [{ $strLenCP: "$songId" }, 24] }  // Check if it's valid ObjectId length
                  ]
                },
                then: { 
                  $convert: {
                    input: "$songId",
                    to: "objectId",
                    onError: "$songId"  // Keep original on error
                  }
                },
                else: "$songId"
              }
            },
            userIdObj: { 
              $cond: { 
                if: { 
                  $and: [
                    { $eq: [{ $type: "$userId" }, "string"] },
                    { $eq: [{ $strLenCP: "$userId" }, 24] }  // Check if it's valid ObjectId length
                  ]
                },
                then: { 
                  $convert: {
                    input: "$userId",
                    to: "objectId",
                    onError: "$userId"  // Keep original on error
                  }
                },
                else: "$userId"
              }
            }
          }
        },
        {
          $lookup: {
            from: "songs",
            localField: "songIdObj",
            foreignField: "_id",
            as: "songData"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userIdObj",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $unwind: { path: "$songData", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$userData", preserveNullAndEmptyArrays: true }
        },
        { $sort: sortOption },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ])
      .toArray();

    return res.status(200).json({
      bids: bids.map(bid => ({
        ...bid,
        _id: bid._id.toString(),
        songId: bid.songId?.toString(),
        userId: bid.userId?.toString(),
        song: bid.songData,
        user: bid.userData
      })),
      pagination: {
        total: totalCount,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    return res.status(500).json({ error: 'Failed to fetch bids' });
  }
} 