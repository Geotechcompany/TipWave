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
  
  // Check authorization (ensure user is modifying their own data)
  if (session.user.id !== djId && !session.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  // GET - Fetch withdrawal methods
  if (req.method === "GET") {
    try {
      const methods = await db
        .collection("djWithdrawalMethods")
        .find({ userId: djId })
        .sort({ isDefault: -1, createdAt: -1 })
        .toArray();
      
      return res.status(200).json({ methods });
    } catch (error) {
      console.error("Error fetching withdrawal methods:", error);
      return res.status(500).json({ error: "Failed to fetch withdrawal methods" });
    }
  }
  
  // POST - Add new withdrawal method
  if (req.method === "POST") {
    try {
      const { methodId, accountNumber, accountName, isDefault, additionalInfo } = req.body;
      
      // Basic validation
      if (!methodId) {
        return res.status(400).json({ error: "Withdrawal method is required" });
      }
      
      if (!accountNumber) {
        return res.status(400).json({ error: "Account number is required" });
      }
      
      // Check if the methodology exists
      const withdrawalMethod = await db
        .collection("withdrawalMethods")
        .findOne({ _id: new ObjectId(methodId) });
      
      if (!withdrawalMethod) {
        return res.status(404).json({ error: "Selected withdrawal method not found" });
      }
      
      // If this is the default method, unset any existing default
      if (isDefault) {
        await db
          .collection("djWithdrawalMethods")
          .updateMany(
            { userId: djId },
            { $set: { isDefault: false } }
          );
      }
      
      // Insert the new method
      const result = await db.collection("djWithdrawalMethods").insertOne({
        userId: djId,
        methodId: methodId,
        accountNumber,
        accountName: accountName || "",
        isDefault: isDefault || false,
        additionalInfo: additionalInfo || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newMethod = await db
        .collection("djWithdrawalMethods")
        .findOne({ _id: result.insertedId });
      
      return res.status(201).json({ method: newMethod });
    } catch (error) {
      console.error("Error adding withdrawal method:", error);
      return res.status(500).json({ error: "Failed to add withdrawal method" });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 