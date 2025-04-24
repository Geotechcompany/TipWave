import { getAuth } from "@clerk/nextjs/server";
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Use environment variables for email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Join DJ TipSync!',
      html: `
        <h1>You've been invited to DJ TipSync!</h1>
        <p>Your friend has invited you to join DJ TipSync, the best way to request songs and support your favorite DJs.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup">Join Now</a>
      `,
    });

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
}