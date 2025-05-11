import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { djId } = req.query;
  const { amount, requestId } = req.body;

  const client = await clientPromise;
  const db = client.db();

  try {
    // Update wallet balance in a transaction
    const session = client.startSession();
    await session.withTransaction(async () => {
      // Update or create wallet
      await db.collection("wallets").updateOne(
        { userId: djId },
        { 
          $inc: { balance: amount },
          $set: { 
            updatedAt: new Date(),
            currency: "KES" // Or use dynamic currency
          }
        },
        { upsert: true }
      );

      // Mark request as processed
      await db.collection("requests").updateOne(
        { _id: requestId },
        { 
          $set: { 
            isProcessed: true,
            processedAt: new Date()
          }
        }
      );
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing earnings:", error);
    return res.status(500).json({ error: "Failed to process earnings" });
  }
} 