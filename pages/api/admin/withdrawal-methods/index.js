import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await clientPromise;
  const db = client.db();

  // GET - Fetch all withdrawal methods
  if (req.method === "GET") {
    try {
      const methods = await db
        .collection("withdrawalMethods")
        .find({})
        .sort({ isActive: -1, name: 1 })
        .toArray();

      return res.status(200).json({ methods });
    } catch (error) {
      console.error("Error fetching withdrawal methods:", error);
      return res.status(500).json({ error: "Failed to fetch withdrawal methods" });
    }
  }

  // POST - Create a new withdrawal method
  if (req.method === "POST") {
    try {
      const {
        name,
        code,
        icon,
        description,
        processingFee,
        processingTime,
        isActive,
        minAmount,
        maxAmount,
        supportedCurrencies,
        requiresAdditionalInfo,
        additionalInfoFields
      } = req.body;

      // Basic validation
      if (!name || !code) {
        return res.status(400).json({ error: "Name and code are required" });
      }

      // Check if code already exists
      const existingMethod = await db
        .collection("withdrawalMethods")
        .findOne({ code });

      if (existingMethod) {
        return res.status(400).json({ error: "A withdrawal method with this code already exists" });
      }

      // Create the new method
      const result = await db.collection("withdrawalMethods").insertOne({
        name,
        code,
        icon: icon || null,
        description: description || "",
        processingFee: parseFloat(processingFee) || 0,
        processingTime: processingTime || "1-2 business days",
        isActive: isActive !== false,
        minAmount: parseFloat(minAmount) || 10,
        maxAmount: parseFloat(maxAmount) || 1000,
        supportedCurrencies: supportedCurrencies || ["USD"],
        requiresAdditionalInfo: requiresAdditionalInfo || false,
        additionalInfoFields: additionalInfoFields || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newMethod = await db
        .collection("withdrawalMethods")
        .findOne({ _id: result.insertedId });

      return res.status(201).json({ method: newMethod });
    } catch (error) {
      console.error("Error creating withdrawal method:", error);
      return res.status(500).json({ error: "Failed to create withdrawal method" });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 