import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ isDj: false, message: "Not authenticated" });
    }

    // Check if the user has DJ role
    const isDj = session.user.role === "DJ";
    
    return res.status(200).json({ 
      isDj,
      message: isDj ? "User has DJ privileges" : "User does not have DJ privileges" 
    });
  } catch (error) {
    console.error("Error verifying DJ status:", error);
    return res.status(500).json({ isDj: false, message: "Server error" });
  }
} 