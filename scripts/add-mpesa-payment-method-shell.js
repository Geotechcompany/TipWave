const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple encryption function for this script only
function encryptData(text, key) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex')
  };
}

// Read encryption key from .env file or use a temporary one
let encryptionKey;
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  const match = envContent.match(/ENCRYPTION_KEY=([^\r\n]+)/);
  encryptionKey = match ? match[1] : crypto.randomBytes(32).toString('hex');
} catch (error) {
  encryptionKey = crypto.randomBytes(32).toString('hex');
}

const mpesaConfig = {
  consumerKey: "01v81EqZptKUHVPgTQlmRV0p53U6PPKNTXGS4MGIIEWiqEeN",
  consumerSecret: "tYCAmiY0WKLMXNTKxXbphhH0UntdWxxng4GewJsUuBusNsw7sSIqQl5O2Pepkqjb",
  passKey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  businessShortCode: "174379",
  callbackUrl: "https://tipwave.netlify.app/api/payments/mpesa/callback"
};

// Encrypt the credentials
const encryptedCredentials = {};
for (const [key, value] of Object.entries(mpesaConfig)) {
  encryptedCredentials[key] = encryptData(value, encryptionKey);
}

const paymentMethod = {
  name: 'M-PESA',
  code: 'mpesa',
  icon: 'mpesa-logo',
  description: 'Pay via M-PESA mobile money',
  processingFee: 0,
  isActive: true,
  requiresRedirect: false,
  supportedCurrencies: ['KES'],
  credentials: encryptedCredentials,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mongoCommand = `
mongosh "${process.env.MONGODB_URI}" --eval '
  db = db.getSiblingDB("${process.env.MONGODB_DB || 'tipwave'}");
  const existingMethod = db.paymentMethods.findOne({ code: "mpesa" });
  
  if (existingMethod) {
    print("M-PESA payment method already exists. Updating credentials...");
    db.paymentMethods.updateOne(
      { code: "mpesa" },
      { $set: ${JSON.stringify({
        name: paymentMethod.name,
        description: paymentMethod.description,
        isActive: paymentMethod.isActive,
        credentials: paymentMethod.credentials,
        updatedAt: paymentMethod.updatedAt
      })} }
    );
    print("M-PESA payment method updated successfully!");
  } else {
    print("Creating new M-PESA payment method...");
    db.paymentMethods.insertOne(${JSON.stringify(paymentMethod)});
    print("M-PESA payment method added successfully!");
  }
'`;

console.log('Executing MongoDB shell command...');
exec(mongoCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});