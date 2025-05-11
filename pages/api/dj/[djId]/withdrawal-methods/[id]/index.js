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
  
  // DELETE - Remove a withdrawal method
  if (req.method === "DELETE") {
    try {
      // Get the payment method first to check if it's default
      const withdrawalMethod = await db
        .collection("djWithdrawalMethods")
        .findOne({ _id: new ObjectId(id), userId: djId });
      
      if (!withdrawalMethod) {
        return res.status(404).json({ error: "Withdrawal method not found" });
      }
      
      // Delete the withdrawal method
      await db
        .collection("djWithdrawalMethods")
        .deleteOne({ _id: new ObjectId(id), userId: djId });
      
      // If this was the default method, set a new default if any remain
      if (withdrawalMethod.isDefault) {
        const remainingMethod = await db
          .collection("djWithdrawalMethods")
          .findOne({ userId: djId });
        
        if (remainingMethod) {
          await db
            .collection("djWithdrawalMethods")
            .updateOne(
              { _id: remainingMethod._id },
              { $set: { isDefault: true, updatedAt: new Date() } }
            );
        }
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting withdrawal method:", error);
      return res.status(500).json({ error: "Failed to delete withdrawal method" });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 