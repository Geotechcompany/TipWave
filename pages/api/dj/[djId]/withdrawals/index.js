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
  
  const { djId } = req.query;
  
  // Check authorization
  if (session.user.id !== djId && !session.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  // POST - Create withdrawal request
  if (req.method === "POST") {
    try {
      const { amount, withdrawalMethodId } = req.body;

      // Enhanced validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid withdrawal amount" });
      }

      if (!withdrawalMethodId) {
        return res.status(400).json({ error: "Withdrawal method is required" });
      }

      // Get withdrawal method details
      const withdrawalMethod = await db
        .collection("djWithdrawalMethods")
        .findOne({
          _id: new ObjectId(withdrawalMethodId),
          userId: djId
        });

      if (!withdrawalMethod) {
        return res.status(400).json({ error: "Invalid withdrawal method" });
      }

      // Check wallet balance
      const wallet = await db.collection("wallets").findOne({ userId: djId });
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ 
          error: "Insufficient balance",
          available: wallet?.balance || 0
        });
      }

      // Create withdrawal and update wallet in a transaction
      const mongoSession = client.startSession();
      try {
        await mongoSession.withTransaction(async () => {
          // Create withdrawal record with enhanced details
          const withdrawal = {
            userId: djId,
            amount,
            withdrawalMethodId: new ObjectId(withdrawalMethodId),
            withdrawalMethod: {
              type: withdrawalMethod.type,
              name: withdrawalMethod.name,
              details: withdrawalMethod.details
            },
            status: "pending",
            currency: wallet.currency || "KES",
            createdAt: new Date(),
            processedAt: null,
            processedBy: null,
            reference: `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            metadata: {
              userEmail: session.user.email,
              userName: session.user.name,
              requestIP: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            }
          };

          const result = await db.collection("withdrawals").insertOne(withdrawal, { session: mongoSession });

          // Update wallet balance
          await db.collection("wallets").updateOne(
            { userId: djId },
            { 
              $inc: { balance: -amount },
              $set: { updatedAt: new Date() }
            },
            { session: mongoSession }
          );

          // Create transaction record
          await db.collection("transactions").insertOne({
            userId: djId,
            type: "withdrawal",
            amount: -amount,
            status: "pending",
            reference: withdrawal.reference,
            description: `Withdrawal request via ${withdrawalMethod.name}`,
            createdAt: new Date(),
            withdrawalId: result.insertedId
          }, { session: mongoSession });

          return res.status(201).json({ 
            success: true,
            withdrawal: {
              ...withdrawal,
              _id: result.insertedId
            }
          });
        });
      } finally {
        await mongoSession.endSession();
      }

    } catch (error) {
      console.error("Error processing withdrawal:", error);
      return res.status(500).json({ error: "Failed to process withdrawal" });
    }
  }

  // GET - Fetch user's withdrawals with enhanced details
  if (req.method === "GET") {
    try {
      const withdrawals = await db
        .collection("withdrawals")
        .aggregate([
          { $match: { userId: djId } },
          {
            $lookup: {
              from: "djWithdrawalMethods",
              localField: "withdrawalMethodId",
              foreignField: "_id",
              as: "methodDetails"
            }
          },
          { $sort: { createdAt: -1 } }
        ])
        .toArray();

      return res.status(200).json({ withdrawals });
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      return res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
} 