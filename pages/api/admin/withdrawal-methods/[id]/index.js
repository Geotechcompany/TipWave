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

  const { id } = req.query;
  
  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const client = await clientPromise;
  const db = client.db();

  // PUT - Update a withdrawal method
  if (req.method === "PUT") {
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

      // Check if code already exists for a different method
      const existingMethod = await db
        .collection("withdrawalMethods")
        .findOne({ code, _id: { $ne: new ObjectId(id) } });

      if (existingMethod) {
        return res.status(400).json({ error: "Another method with this code already exists" });
      }

      // Update the method
      await db.collection("withdrawalMethods").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
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
            updatedAt: new Date()
          }
        }
      );

      const updatedMethod = await db
        .collection("withdrawalMethods")
        .findOne({ _id: new ObjectId(id) });

      return res.status(200).json({ method: updatedMethod });
    } catch (error) {
      console.error("Error updating withdrawal method:", error);
      return res.status(500).json({ error: "Failed to update withdrawal method" });
    }
  }

  // DELETE - Remove a withdrawal method
  if (req.method === "DELETE") {
    try {
      const result = await db
        .collection("withdrawalMethods")
        .deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Withdrawal method not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting withdrawal method:", error);
      return res.status(500).json({ error: "Failed to delete withdrawal method" });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
} 