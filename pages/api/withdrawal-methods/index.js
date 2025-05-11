import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  try {
    // Only return active withdrawal methods
    const methods = await db
      .collection("withdrawalMethods")
      .find({ isActive: true })
      .project({
        name: 1,
        code: 1,
        icon: 1,
        description: 1,
        processingFee: 1,
        processingTime: 1,
        minAmount: 1,
        maxAmount: 1,
        requiresAdditionalInfo: 1,
        additionalInfoFields: 1
      })
      .sort({ name: 1 })
      .toArray();
    
    return res.status(200).json({ methods });
  } catch (error) {
    console.error("Error fetching withdrawal methods:", error);
    return res.status(500).json({ error: "Failed to fetch withdrawal methods" });
  }
} 