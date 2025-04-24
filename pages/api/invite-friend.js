import { sendNotificationEmail, EmailTypes } from '@/lib/email';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // Send invitation email with better error handling
    const result = await sendNotificationEmail({
      to: email,
      type: EmailTypes.FRIEND_INVITATION,
      data: {
        userName: email.split('@')[0],
        inviterName: session.user.name || 'A friend',
        inviterEmail: session.user.email,
        invitationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?referral=${encodeURIComponent(session.user.email)}`
      }
    });
    
    if (!result.success) {
      console.error('Email service reported failure:', result.error);
      throw new Error(result.error || 'Failed to send invitation');
    }
    
    console.log(`Friend invitation email sent to ${email}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return res.status(500).json({ error: 'Failed to send invitation', details: error.message });
  }
}