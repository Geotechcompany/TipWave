const ngrok = require('ngrok');
const fs = require('fs');
require('dotenv').config();

async function startTunnel() {
  try {
    const url = await ngrok.connect({
      addr: 3000, // Your local server port
      region: 'eu', // or 'us', 'au', 'ap', 'sa', 'jp', 'in'
    });
    
    console.log(`Ngrok tunnel is running at: ${url}`);
    console.log(`M-Pesa callback URL: ${url}/api/payments/mpesa/callback`);
    
    // Update your .env file with the new URL
    const envContent = fs.readFileSync('.env', 'utf8');
    const newEnvContent = envContent.replace(
      /MPESA_CALLBACK_URL=.*/,
      `MPESA_CALLBACK_URL=${url}/api/payments/mpesa/callback`
    );
    
    fs.writeFileSync('.env', newEnvContent);
    console.log('Updated .env file with ngrok URL');
    
  } catch (error) {
    console.error('Error starting ngrok tunnel:', error);
  }
}

startTunnel(); 