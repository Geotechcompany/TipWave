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
  
  // GET - Fetch payment methods
  if (req.method === "GET") {
    try {
      const paymentMethods = await db
        .collection("paymentMethods")
        .find({ userId: djId })
        .sort({ isDefault: -1, createdAt: -1 })
        .toArray();
      
      return res.status(200).json({ paymentMethods });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  }
  
  // POST - Add new payment or withdrawal method
  if (req.method === "POST") {
    try {
      const { 
        type, 
        methodType, // "payment" or "withdrawal"
        phoneNumber, 
        accountNumber,
        accountName, 
        methodId,
        isDefault,
        name,
        additionalInfo 
      } = req.body;
      
      // Basic validation based on method type
      if (methodType === "payment") {
        if (!type) {
          return res.status(400).json({ error: "Payment type is required" });
        }
        
        if (type === "mpesa" && !phoneNumber) {
          return res.status(400).json({ error: "Phone number is required for M-PESA" });
        }
        
        // If this is the default method, unset any existing default
        if (isDefault) {
          await db
            .collection("paymentMethods")
            .updateMany(
              { userId: djId, methodType: "payment" },
              { $set: { isDefault: false } }
            );
        }
        
        // Insert the new payment method
        const result = await db.collection("paymentMethods").insertOne({
          userId: djId,
          methodType: "payment",
          type,
          phoneNumber,
          name: name || "",
          isDefault: isDefault || false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const paymentMethod = await db
          .collection("paymentMethods")
          .findOne({ _id: result.insertedId });
        
        return res.status(201).json({ paymentMethod });
      } 
      else if (methodType === "withdrawal") {
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
            .collection("paymentMethods")
            .updateMany(
              { userId: djId, methodType: "withdrawal" },
              { $set: { isDefault: false } }
            );
        }
        
        // Insert the new method
        const result = await db.collection("paymentMethods").insertOne({
          userId: djId,
          methodType: "withdrawal",
          methodId,
          accountNumber,
          accountName: accountName || "",
          isDefault: isDefault || false,
          additionalInfo: additionalInfo || {},
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const createdWithdrawalMethod = await db
          .collection("paymentMethods")
          .findOne({ _id: result.insertedId });
        
        return res.status(201).json({ withdrawalMethod: createdWithdrawalMethod });
      }
      
      return res.status(400).json({ error: "Invalid method type" });
    } catch (error) {
      console.error("Error adding method:", error);
      return res.status(500).json({ error: `Failed to add ${req.body.methodType || 'payment'} method` });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 