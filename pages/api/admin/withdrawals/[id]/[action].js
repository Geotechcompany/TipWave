import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, action } = req.query;
  
  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const client = await clientPromise;
  const db = client.db();

  try {
    const withdrawal = await db
      .collection("withdrawals")
      .findOne({ _id: new ObjectId(id) });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal is not pending" });
    }

    await db.collection("withdrawals").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: action === "approve" ? "approved" : "rejected",
          processedAt: new Date(),
          processedBy: session.user.id
        } 
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error ${action}ing withdrawal:`, error);
    return res.status(500).json({ error: `Failed to ${action} withdrawal` });
  }
} 