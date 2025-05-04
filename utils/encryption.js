import crypto from 'crypto';

// This should match your actual environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only';
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data before storing in DB
export function encryptData(text) {
  if (!text) return null;
  
  try {
    const rawKey = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only';
    
    // Create a consistent 32-byte key by hashing the raw key
    const ENCRYPTION_KEY = crypto.createHash('sha256').update(rawKey).digest();
    const ALGORITHM = 'aes-256-cbc';
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(String(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

// Decrypt data when needed for API calls
export function decryptData(encryptedData) {
  if (!encryptedData || !encryptedData.iv || !encryptedData.data) return null;
  
  try {
    const rawKey = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only';
    
    // Create a consistent 32-byte key by hashing the raw key
    const ENCRYPTION_KEY = crypto.createHash('sha256').update(rawKey).digest();
    const ALGORITHM = 'aes-256-cbc';
    
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const encryptedText = Buffer.from(encryptedData.data, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
} 