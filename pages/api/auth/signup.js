import { sendNotificationEmail, EmailTypes } from '@/lib/email';

// Inside the handler function after successful user creation
const { name, email } = req.body;

// Send welcome email
await sendNotificationEmail(EmailTypes.USER_WELCOME, email, {
  userName: name
});

// Then continue with the rest of the function... 