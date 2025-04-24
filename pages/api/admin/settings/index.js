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

  try {
    const client = await clientPromise;
    const db = client.db();
    const settingsCollection = db.collection("settings");
    
    // Ensure we have a system settings document
    const settingsDoc = await settingsCollection.findOne({ _id: "system_settings" });
    
    if (req.method === "GET") {
      // Return the settings document or defaults if not found
      if (!settingsDoc) {
        // Return default settings
        return res.status(200).json({
          minBidAmount: 5,
          maxBidAmount: 100,
          commissionRate: 10,
          allowGuestBids: true,
          requireEmailVerification: true,
          enableNotifications: true,
          notifyOnNewBid: true,
          notifyOnBidApproval: true
        });
      }
      
      // Remove internal fields
      const { _id, createdAt, updatedAt, ...settings } = settingsDoc;
      
      return res.status(200).json(settings);
    } else if (req.method === "POST") {
      // Validate settings
      const {
        minBidAmount,
        maxBidAmount,
        commissionRate,
        allowGuestBids,
        requireEmailVerification,
        enableNotifications,
        notifyOnNewBid,
        notifyOnBidApproval
      } = req.body;
      
      // Basic validation
      if (
        typeof minBidAmount !== 'number' || 
        typeof maxBidAmount !== 'number' || 
        typeof commissionRate !== 'number'
      ) {
        return res.status(400).json({ error: "Invalid numeric values" });
      }
      
      if (minBidAmount < 0 || maxBidAmount < 0 || commissionRate < 0) {
        return res.status(400).json({ error: "Values cannot be negative" });
      }
      
      if (minBidAmount > maxBidAmount) {
        return res.status(400).json({ 
          error: "Minimum bid amount cannot be greater than maximum bid amount" 
        });
      }
      
      if (commissionRate > 100) {
        return res.status(400).json({ error: "Commission rate cannot exceed 100%" });
      }
      
      // Update or create settings document
      const updateResult = await settingsCollection.updateOne(
        { _id: "system_settings" },
        { 
          $set: {
            minBidAmount,
            maxBidAmount,
            commissionRate,
            allowGuestBids,
            requireEmailVerification,
            enableNotifications,
            notifyOnNewBid,
            notifyOnBidApproval,
            updatedAt: new Date(),
            updatedBy: session.user.id || session.user.email
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      
      return res.status(200).json({ 
        success: true,
        message: "Settings updated successfully" 
      });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error managing settings:", error);
    return res.status(500).json({ error: "Failed to manage settings" });
  }
} 