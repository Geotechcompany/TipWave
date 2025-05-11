import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";


export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Debug log to check session data
    console.log("Session user:", session.user);
    
    // Check admin status directly from session
    if (session.user?.role !== "ADMIN") {
      console.log("User is not admin:", session.user);
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    const client = await clientPromise;
    const db = client.db();

    if (req.method === "GET") {
      const { status = "pending" } = req.query;
      
      const withdrawals = await db
        .collection("withdrawals")
        .aggregate([
          { 
            $match: { 
              status: status.toLowerCase()
            } 
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { 
                  $match: { 
                    $expr: { 
                      $eq: ["$_id", { $toObjectId: "$$userId" }] 
                    } 
                  } 
                }
              ],
              as: "user"
            }
          },
          {
            $lookup: {
              from: "djWithdrawalMethods",
              let: { methodId: "$withdrawalMethodId" },
              pipeline: [
                { 
                  $match: { 
                    $expr: { 
                      $eq: ["$_id", { $toObjectId: "$$methodId" }] 
                    } 
                  } 
                }
              ],
              as: "withdrawalMethod"
            }
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: "$withdrawalMethod",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $sort: { createdAt: -1 }
          }
        ])
        .toArray();

      console.log(`Found ${withdrawals.length} withdrawals with status: ${status}`);
      return res.status(200).json({ withdrawals });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in withdrawal handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 