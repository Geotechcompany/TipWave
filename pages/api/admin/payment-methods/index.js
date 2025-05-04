import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  // Check admin privileges
  if (!session) {
    return res.status(401).json({ error: "Unauthorized - No session" });
  }
  
  const isAdmin = 
    session.user.isAdmin === true || 
    session.user.role === "admin" || 
    session.user.role === "ADMIN" ||
    (session.user.permissions && session.user.permissions.includes("admin"));
  
  if (!isAdmin) {
    return res.status(401).json({ error: "Unauthorized - Not an admin" });
  }

  const client = await clientPromise;
  const db = client.db();
  
  // GET - Fetch all payment methods
  if (req.method === "GET") {
    try {
      const paymentMethods = await db.collection("paymentMethods")
        .find({})
        .toArray();
      
      return res.status(200).json({ paymentMethods });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  } 
  
  // POST - Create a new payment method
  else if (req.method === "POST") {
    try {
      const { 
        name, 
        code, 
        icon, 
        description, 
        processingFee, 
        isActive, 
        requiresRedirect,
        supportedCurrencies,
        credentials
      } = req.body;
      
      // Validation
      if (!name || !code) {
        return res.status(400).json({ error: "Name and code are required" });
      }
      
      // Check if payment method already exists
      const existingMethod = await db.collection("paymentMethods").findOne({ code });
      if (existingMethod) {
        return res.status(400).json({ error: "Payment method with this code already exists" });
      }
      
      // Create payment method
      const newPaymentMethod = {
        name,
        code,
        icon: icon || null,
        description: description || "",
        processingFee: processingFee || 0,
        isActive: isActive !== false,
        requiresRedirect: requiresRedirect === true,
        supportedCurrencies: supportedCurrencies || ["USD"],
        credentials: credentials || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection("paymentMethods").insertOne(newPaymentMethod);
      
      return res.status(201).json({
        success: true,
        message: "Payment method created successfully",
        paymentMethodId: result.insertedId
      });
    } catch (error) {
      console.error("Error creating payment method:", error);
      return res.status(500).json({ error: "Failed to create payment method" });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ error: "Method not allowed" });
  }
} 