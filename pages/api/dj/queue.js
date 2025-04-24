import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
//import { connectToDatabase } from "@/lib/db";

export default async function handler(req, res) {
  // Replace Clerk auth with NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify the user has DJ role
  if (session.user.role !== 'DJ' && 
      session.user.role !== 'BOTH' && 
      session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - DJ permissions required' });
  }
  
  // Redirect to the existing songs/queue endpoint for now
  return res.redirect(307, '/api/songs/queue');
} 