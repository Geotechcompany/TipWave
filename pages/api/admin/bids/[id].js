import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

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

  if (req.method === 'PUT') {
    // After bid update is successful:
    
    // Get user email
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(bid.userId) });
    
    // Get song details
    const songsCollection = db.collection('songs');
    const song = await songsCollection.findOne({ _id: new ObjectId(bid.songId) });
    
    // Determine email type based on status
    let emailType = null;
    if (updatedBid.status === 'APPROVED') {
      emailType = EmailTypes.BID_APPROVED;
    } else if (updatedBid.status === 'REJECTED') {
      emailType = EmailTypes.BID_REJECTED;
    }
    
    // Send notification if status changed to approved or rejected
    if (emailType && user.email) {
      await sendNotificationEmail(emailType, user.email, {
        userName: user.name || user.email.split('@')[0],
        amount: bid.amount,
        songTitle: song.title
      });
    }
    
    // Continue with response
  }
  
  // Handle GET and other methods
  
  return res.status(405).json({ error: "Method not allowed" });
} 