import { checkAdminAuth } from '../emails/auth-middleware';
import clientPromise from '@/lib/mongodb';
import { defaultCurrencies } from '@/lib/models/currency';

export default async function handler(req, res) {
  // Check admin authentication
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  const client = await clientPromise;
  const db = client.db();
  const currencies = db.collection('currencies');

  // GET: List all currencies
  if (req.method === 'GET') {
    try {
      const currencyList = await currencies.find({}).sort({ isDefault: -1, code: 1 }).toArray();
      
      // Initialize default currencies if none exist
      if (currencyList.length === 0) {
        await currencies.insertMany(defaultCurrencies);
        return res.status(200).json({ currencies: defaultCurrencies });
      }
      
      return res.status(200).json({ currencies: currencyList });
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return res.status(500).json({ message: 'Failed to fetch currencies', error: error.message });
    }
  }
  
  // POST: Create a new currency
  if (req.method === 'POST') {
    try {
      const { code, symbol, name, rate, isActive } = req.body;
      
      // Validate required fields
      if (!code || !symbol || !name || rate === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check if currency code already exists
      const existingCurrency = await currencies.findOne({ code });
      if (existingCurrency) {
        return res.status(400).json({ message: 'Currency code already exists' });
      }
      
      const newCurrency = {
        code,
        symbol,
        name,
        isDefault: false, // New currencies are never default by default
        rate: Number(rate),
        isActive: Boolean(isActive),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await currencies.insertOne(newCurrency);
      return res.status(201).json({ 
        message: 'Currency created successfully',
        currency: { _id: result.insertedId, ...newCurrency } 
      });
    } catch (error) {
      console.error('Error creating currency:', error);
      return res.status(500).json({ message: 'Failed to create currency', error: error.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 