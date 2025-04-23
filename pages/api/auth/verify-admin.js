import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ isAdmin: false, message: "Not authenticated" });
    }

    // Check if the user has admin role
    const isAdmin = session.user.role === "ADMIN";
    
    return res.status(200).json({ 
      isAdmin,
      message: isAdmin ? "User has admin privileges" : "User does not have admin privileges" 
    });
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return res.status(500).json({ isAdmin: false, message: "Server error" });
  }
} 