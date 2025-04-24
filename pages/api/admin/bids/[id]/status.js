import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
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

  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;
    
    // Validate inputs
    if (!id) {
      return res.status(400).json({ error: "Bid ID is required" });
    }
    
    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      console.warn(`Invalid bid ID format: ${id}`, error);
      return res.status(400).json({ error: "Invalid bid ID format" });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Update the bid status
    const updateResult = await db.collection("song_requests").updateOne(
      { _id: objectId },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          updatedBy: session.user.id || session.user.email
        } 
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Bid not found" });
    }
    
    return res.status(200).json({
      success: true,
      message: "Bid status updated successfully",
      status
    });
  } catch (error) {
    console.error("Error updating bid status:", error);
    return res.status(500).json({ error: "Failed to update bid status" });
  }
} 