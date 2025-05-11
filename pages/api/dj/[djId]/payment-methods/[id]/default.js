import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const { djId, id } = req.query;
  
  // Check authorization (ensure user is modifying their own data)
  if (session.user.id !== djId && !session.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  // PUT - Set a payment method as default
  if (req.method === "PUT") {
    try {
      // First, unset any existing default
      await db
        .collection("paymentMethods")
        .updateMany(
          { userId: djId },
          { $set: { isDefault: false } }
        );
      
      // Then set the selected method as default
      const result = await db
        .collection("paymentMethods")
        .updateOne(
          { _id: new ObjectId(id), userId: djId },
          { $set: { isDefault: true, updatedAt: new Date() } }
        );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      return res.status(500).json({ error: "Failed to set default payment method" });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 