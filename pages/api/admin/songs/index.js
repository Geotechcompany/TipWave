import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // Check authentication using NextAuth
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

  const client = await clientPromise;
  const db = client.db();
  const songsCollection = db.collection("songs");

  try {
    // GET - Fetch songs with pagination, search, and filtering
    if (req.method === "GET") {
      const {
        page = "1",
        limit = "10",
        search = "",
        filter = "all",
        sort = "newest"
      } = req.query;
      
      // Build query
      let query = {};
      
      // Add search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { artist: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } }
        ];
      }
      
      // Handle specific filters
      if (filter === "explicit") {
        query.isExplicit = true;
      } else if (filter === "clean") {
        query.isExplicit = false;
      }
      
      // Determine sort order
      let sortOption = {};
      switch (sort) {
        case "title":
          sortOption = { title: 1 };
          break;
        case "artist":
          sortOption = { artist: 1 };
          break;
        case "popularity":
          sortOption = { popularity: -1 };
          break;
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        default: // newest
          sortOption = { createdAt: -1 };
      }
      
      // Parse pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      // Fetch songs with pagination
      const songs = await songsCollection
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .toArray();
      
      // Get total count for pagination
      const total = await songsCollection.countDocuments(query);
      
      return res.status(200).json({
        songs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    }
    
    // POST - Create a new song
    else if (req.method === "POST") {
      const { title, artist, genre, duration, releaseYear, albumArt, isExplicit, popularity } = req.body;
      
      // Validate required fields
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and artist are required" });
      }
      
      // Create new song document
      const newSong = {
        title,
        artist,
        genre,
        duration: duration ? parseDuration(duration) : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        albumArt,
        isExplicit: !!isExplicit,
        popularity: popularity ? parseInt(popularity) : 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id || session.user.email
      };
      
      const result = await songsCollection.insertOne(newSong);
      
      return res.status(201).json({
        success: true,
        message: "Song created successfully",
        songId: result.insertedId
      });
    }
    
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error managing songs:", error);
    return res.status(500).json({ error: "Failed to manage songs" });
  }
}

// Helper function to parse duration string to seconds
function parseDuration(durationString) {
  if (!durationString) return null;
  
  const parts = durationString.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0]);
    const secs = parseInt(parts[1]);
    if (!isNaN(mins) && !isNaN(secs)) {
      return mins * 60 + secs;
    }
  }
  return null;
} 