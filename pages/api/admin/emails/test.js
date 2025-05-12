import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Get both settings
    const smtpSettings = await db.collection('smtp_settings').findOne({ type: 'smtp_config' });
    const resendSettings = await db.collection('resend_settings').findOne({ type: 'resend_config' });
    
    if (!smtpSettings?.isEnabled && !resendSettings?.isEnabled) {
      return res.status(400).json({ error: 'No email provider is enabled' });
    }

    const { to, subject, text, html } = req.body;
    let result;

    if (smtpSettings?.isEnabled) {
      // Use SMTP with enhanced configuration
      const transport = nodemailer.createTransport({
        host: smtpSettings.host,
        port: parseInt(smtpSettings.port),
        secure: smtpSettings.secure,
        auth: {
          user: smtpSettings.user,
          pass: smtpSettings.password,
        },
        debug: true,
        logger: true,
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 1,
        socketTimeout: 60000, // 1 minute timeout
        connectionTimeout: 60000, // 1 minute timeout
      });

      try {
        // Verify connection before sending
        await transport.verify();
        console.log('SMTP Connection verified');
        
        // Add delay before sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        result = await transport.sendMail({
          from: smtpSettings.from,
          to,
          subject,
          text,
          html,
          headers: {
            'x-priority': '1',
            'x-msmail-priority': 'High',
            importance: 'high'
          }
        });

        // Close the connection after sending
        transport.close();
      } catch (error) {
        console.error('SMTP Error:', error);
        transport.close();
        throw error;
      }
    } else if (resendSettings?.isEnabled) {
      const resend = new Resend(resendSettings.apiKey);
      result = await resend.emails.send({
        from: resendSettings.fromEmail,
        to,
        subject,
        text,
        html
      });
    }

    // Log the email attempt
    await db.collection('email_logs').insertOne({
      type: 'test',
      provider: smtpSettings?.isEnabled ? 'smtp' : 'resend',
      recipient: to,
      subject,
      status: 'sent',
      messageId: result?.messageId || result?.id,
      sentAt: new Date(),
      response: JSON.stringify(result)
    });

    return res.status(200).json({
      success: true,
      messageId: result?.messageId || result?.id,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    
    // Log the failed attempt
    try {
      const client = await clientPromise;
      const db = client.db();
      await db.collection('email_logs').insertOne({
        type: 'test',
        recipient: req.body.to,
        subject: req.body.subject,
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
} 