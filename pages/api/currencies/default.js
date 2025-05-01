
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
 
    const client = await clientPromise;
    const db = client.db();
    
    // Try to find a currency marked as default
    let defaultCurrency = await db.collection('currencies').findOne({ isDefault: true });
    
    // If no default currency is set, use KES as fallback
    if (!defaultCurrency) {
      defaultCurrency = {
        code: 'KES',
        symbol: 'Ksh',
        name: 'Kenyan Shilling',
        isDefault: true
      };
    }
    
    res.status(200).json(defaultCurrency);
  } catch (error) {
    console.error('Error fetching default currency:', error);
    // Always return a usable fallback
    res.status(200).json({ 
      code: 'KES',
      symbol: 'Ksh',
      name: 'Kenyan Shilling',
      isDefault: true
    });
  }
} 