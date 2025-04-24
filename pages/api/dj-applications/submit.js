import { sendNotificationEmail, EmailTypes } from '@/lib/email';

// After successfully submitting a DJ application
const result = await applications.insertOne(newApplication);

// Send confirmation email to applicant with better error handling
try {
  await sendNotificationEmail({
    to: session.user.email,
    type: EmailTypes.DJ_APPLICATION_RECEIVED,
    data: {
      userName: session.user.name || session.user.email.split('@')[0],
      applicationId: result.insertedId.toString()
    }
  });
  console.log(`Application confirmation email sent to ${session.user.email}`);
} catch (emailError) {
  console.error('Failed to send application confirmation email:', emailError);
  // Continue with the response even if email fails
}

// Notify admin about new application
try {
  await sendNotificationEmail({
    to: process.env.ADMIN_EMAIL || 'arthurbreck417@gmail.com',
    type: EmailTypes.NEW_DJ_APPLICATION_ADMIN || EmailTypes.DJ_APPLICATION_RECEIVED,
    data: {
      applicantName: session.user.name,
      applicantEmail: session.user.email,
      applicationId: result.insertedId.toString()
    }
  });
  console.log(`Admin notification email sent to ${process.env.ADMIN_EMAIL}`);
} catch (emailError) {
  console.error('Failed to send admin notification email:', emailError);
  // Continue with the response even if email fails
} 