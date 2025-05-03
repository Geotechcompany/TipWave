import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Currency code is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Find the currency with the specified code
    const currency = await db.collection('currencies').findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!currency) {
      // If currency not found, try to get the default currency
      const defaultCurrency = await db.collection('currencies').findOne({ 
        isDefault: true 
      }) || { 
        code: 'KES', 
        symbol: 'Ksh', 
        name: 'Kenyan Shilling',
        isDefault: true
      };
      
      return res.status(200).json(defaultCurrency);
    }
    
    return res.status(200).json(currency);
  } catch (error) {
    console.error('Error fetching currency:', error);
    
    // Return a default currency as fallback
    return res.status(200).json({ 
      code: 'KES', 
      symbol: 'Ksh', 
      name: 'Kenyan Shilling' 
    });
  }
}