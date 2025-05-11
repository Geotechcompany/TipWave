import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  
  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ error: "isActive must be a boolean" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db
      .collection("withdrawalMethods")
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            isActive,
            updatedAt: new Date()
          } 
        }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Withdrawal method not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating withdrawal method status:", error);
    return res.status(500).json({ error: "Failed to update withdrawal method status" });
  }
} 