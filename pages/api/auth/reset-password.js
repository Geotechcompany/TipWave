import { findUserByEmail } from '@/lib/models/user';
import { sendResetEmail } from '@/lib/email';
import { generateResetToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      // Return success even if user not found for security
      return res.status(200).json({ message: 'If an account exists, a reset email will be sent' });
    }

    const resetToken = await generateResetToken(user.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail({
      to: email,
      resetUrl,
      name: user.name
    });

    res.status(200).json({ message: 'Reset email sent successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
} 