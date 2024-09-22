import { getAuth } from "@clerk/nextjs/server";
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Create a test account if you don't have a real email service
    // let testAccount = await nodemailer.createTestAccount();

    // Create a transporter using your email service credentials
    let transporter = nodemailer.createTransport({
      host: "smtp.yourservice.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the invite email
    let info = await transporter.sendMail({
      from: '"TipWave" <noreply@yourapp.com>',
      to: email,
      subject: "You've been invited to join Our App!",
      text: `Your friend has invited you to join Our App! Sign up now and get a free bid: https://yourapp.com/signup?ref=${userId}`,
      html: `<p>Your friend has invited you to join Our App!</p><p><a href="https://yourapp.com/signup?ref=${userId}">Sign up now and get a free bid!</a></p>`,
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
}