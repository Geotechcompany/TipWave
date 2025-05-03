import { sendEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;
    console.log(`Welcome email request received for ${email}`);

    if (!name || !email) {
      console.error('Missing required fields:', { name, email });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Send the welcome email with better error handling
    try {
      await sendWelcomeEmail({ name, email });
      console.log(`Welcome email successfully sent to ${email}`);
    } catch (emailError) {
      console.error('Error in sendWelcomeEmail function:', emailError);
      // Still return success to client but log the error
      return res.status(200).json({ 
        success: true, 
        warning: 'Email processed but delivery may have failed' 
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in welcome email handler:', error);
    return res.status(500).json({ 
      error: 'Failed to send welcome email', 
      details: error.message 
    });
  }
}

async function sendWelcomeEmail({ name, email }) {
  const subject = 'Welcome to TipWave! Here\'s How to Get Started';
  
  // Update HTML content to match your app's name and features
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin-bottom: 10px;">Welcome to TipWave, ${name}!</h1>
        <p style="font-size: 18px; color: #4b5563;">We're excited to have you on board.</p>
      </header>

      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #4338ca; margin-top: 0;">Here's how to get started:</h2>
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: #4f46e5; margin-bottom: 8px;">1. Complete Your Profile</h3>
          <p>Add your profile picture and additional information to make your account stand out.</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: #4f46e5; margin-bottom: 8px;">2. Explore the Dashboard</h3>
          <p>Your dashboard gives you an overview of your activity and quick access to all features.</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: #4f46e5; margin-bottom: 8px;">3. Top Up Your Wallet</h3>
          <p>Add funds to your wallet to request songs and tip your favorite DJs.</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="color: #4f46e5; margin-bottom: 8px;">4. Make Song Requests</h3>
          <p>Request your favorite songs at events and support the DJs you love.</p>
        </div>
      </div>
      
      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #10b981;">
        <h3 style="color: #047857; margin-top: 0;">Need Help?</h3>
        <p>If you have any questions or need assistance, our support team is here for you:</p>
        <p><a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #0891b2; text-decoration: none;">${process.env.ADMIN_EMAIL}</a></p>
      </div>
      
      <footer style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
        <p>Thank you for joining us!</p>
        <p style="font-size: 14px;">© ${new Date().getFullYear()} TipWave. All rights reserved.</p>
      </footer>
    </div>
  `;

  // Update text content to match the HTML
  const textContent = `
Welcome to TipWave, ${name}!
We're excited to have you on board.

Here's how to get started:

1. Complete Your Profile
   Add your profile picture and additional information to make your account stand out.

2. Explore the Dashboard
   Your dashboard gives you an overview of your activity and quick access to all features.

3. Top Up Your Wallet
   Add funds to your wallet to request songs and tip your favorite DJs.

4. Make Song Requests
   Request your favorite songs at events and support the DJs you love.

Need Help?
If you have any questions or need assistance, our support team is here for you:
${process.env.ADMIN_EMAIL}

Thank you for joining us!
© ${new Date().getFullYear()} TipWave. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject,
    html: htmlContent,
    text: textContent,
  });
} 