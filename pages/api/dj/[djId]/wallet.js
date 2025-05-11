import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { djId } = req.query;
  
  if (session.user.id !== djId && !session.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const client = await clientPromise;
  const db = client.db();

  // GET - Fetch wallet balance
  if (req.method === "GET") {
    try {
      // Get wallet document
      let wallet = await db.collection("wallets").findOne({ userId: djId });
      
      // Calculate total earnings from completed song requests
      const songRequests = await db.collection("song_requests").aggregate([
        { 
          $match: { 
            djId: djId,
            status: "completed",
            isProcessed: { $ne: true } // Only unprocessed requests
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray();

      const totalEarnings = songRequests[0]?.total || 0;

      // Start a session for the transaction
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          if (!wallet) {
            // Create new wallet with earnings
            wallet = {
              userId: djId,
              balance: totalEarnings,
              currency: "KES",
              updatedAt: new Date()
            };
            await db.collection("wallets").insertOne(wallet);
          } else {
            // Update existing wallet
            await db.collection("wallets").updateOne(
              { userId: djId },
              { 
                $inc: { balance: totalEarnings },
                $set: { updatedAt: new Date() }
              }
            );
          }

          // Mark requests as processed if there are earnings
          if (totalEarnings > 0) {
            await db.collection("song_requests").updateMany(
              { 
                djId: djId,
                status: "completed",
                isProcessed: { $ne: true }
              },
              { 
                $set: { 
                  isProcessed: true,
                  processedAt: new Date()
                }
              }
            );
          }
        });
      } finally {
        await session.endSession();
      }

      // Refresh wallet data after transaction
      wallet = await db.collection("wallets").findOne({ userId: djId });

      return res.status(200).json({ 
        wallet: {
          ...wallet,
          pendingEarnings: totalEarnings
        }
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      return res.status(500).json({ error: "Failed to fetch wallet" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
} 