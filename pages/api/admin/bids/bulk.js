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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bidIds, action } = req.body;
    
    // Validate inputs
    if (!bidIds || !Array.isArray(bidIds) || bidIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing bid IDs" });
    }
    
    if (!action || !['approved', 'rejected', 'completed'].includes(action)) {
      return res.status(400).json({ error: "Invalid or missing action" });
    }
    
    // Convert string IDs to ObjectId
    const objectIds = bidIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.warn(`Invalid ObjectId: ${id}`, error);
        return null;
      }
    }).filter(id => id !== null);
    
    if (objectIds.length === 0) {
      return res.status(400).json({ error: "No valid bid IDs provided" });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Update all bids with the specified IDs
    const updateResult = await db.collection("song_requests").updateMany(
      { _id: { $in: objectIds } },
      { 
        $set: { 
          status: action,
          updatedAt: new Date(),
          updatedBy: session.user.id || session.user.email
        } 
      }
    );
    
    // Return the result
    return res.status(200).json({
      success: true,
      message: `${updateResult.modifiedCount} bids updated successfully`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error processing bulk operations:', error);
    res.status(500).json({ error: 'Failed to process bulk operations' });
  }
} 