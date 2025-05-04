const crypto = require('crypto');

// Generate a secure random 32-byte (256-bit) key and format as hex
const key = crypto.randomBytes(32).toString('hex');
console.log('Add this key to your .env file as ENCRYPTION_KEY:');
console.log(key); 