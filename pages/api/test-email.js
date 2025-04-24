import { sendNotificationEmail, EmailTypes } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email = 'arthurbreck417@gmail.com', type = 'USER_WELCOME' } = req.body;
    
    console.log(`Attempting to send test email to ${email} of type ${type}`);
    
    const result = await sendNotificationEmail({
      to: email,
      type: type in EmailTypes ? type : EmailTypes.USER_WELCOME,
      data: {
        userName: 'Test User',
        songTitle: 'Test Song',
        songArtist: 'Test Artist',
        amount: '10.00',
        status: 'PENDING',
        applicationId: '12345',
        inviterName: 'Test Inviter',
        inviterEmail: 'inviter@example.com',
        invitationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?referral=test`
      }
    });

    if (result.success) {
      console.log('Test email sent successfully:', result);
      return res.status(200).json({ success: true, messageId: result.messageId });
    } else {
      console.error('Email service reported failure:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send test email', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 