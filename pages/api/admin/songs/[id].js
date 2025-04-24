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

  // Get song ID from request
  const { id } = req.query;
  
  // Validate object ID
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid song ID" });
  }

  const client = await clientPromise;
  const db = client.db();
  const songsCollection = db.collection("songs");

  try {
    // GET - Fetch single song details
    if (req.method === "GET") {
      const song = await songsCollection.findOne({ _id: new ObjectId(id) });
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      return res.status(200).json(song);
    }
    
    // PUT - Update song details
    else if (req.method === "PUT") {
      const { title, artist, genre, duration, releaseYear, albumArt, isExplicit, popularity } = req.body;
      
      // Validate required fields
      if (!title || !artist) {
        return res.status(400).json({ error: "Title and artist are required" });
      }
      
      // Create updated song document
      const updatedSong = {
        title,
        artist,
        genre,
        duration: duration ? parseDuration(duration) : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        albumArt,
        isExplicit: !!isExplicit,
        popularity: popularity ? parseInt(popularity) : 50,
        updatedAt: new Date()
      };
      
      const result = await songsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedSong }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Song not found" });
      }
      
      return res.status(200).json({
        success: true,
        message: "Song updated successfully"
      });
    }
    
    // DELETE - Remove a song
    else if (req.method === "DELETE") {
      // Check if song has any active requests before deleting
      const bidsCollection = db.collection("bids");
      const activeBids = await bidsCollection.countDocuments({
        songId: new ObjectId(id),
        status: { $in: ["PENDING", "ACCEPTED", "PLAYING"] }
      });
      
      if (activeBids > 0) {
        return res.status(400).json({
          error: "Cannot delete song with active bids"
        });
      }
      
      const result = await songsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Song not found" });
      }
      
      return res.status(200).json({
        success: true,
        message: "Song deleted successfully"
      });
    }
    
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error managing song:", error);
    return res.status(500).json({ error: "Failed to manage song" });
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