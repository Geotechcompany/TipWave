import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch currencies from database
    const currenciesData = await db.collection('currencies').find({}).toArray();
    
    // Find the default currency (assuming there's a field isDefault = true)
    const defaultCurrency = currenciesData.find(c => c.isDefault) || {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      exchangeRate: 1,
      isDefault: true
    };
    
    // Get user's preferred currency if they're logged in
    let userCurrency = null;
    const session = await getServerSession(req, res, authOptions);
    
    if (session && session.user) {
      const userId = session.user.id;
      
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) }
      );
      
      if (user && user.preferredCurrency) {
        userCurrency = currenciesData.find(c => c.code === user.preferredCurrency) || defaultCurrency;
      }
    }
    
    // Return the currencies and default currency
    return res.status(200).json({
      currencies: currenciesData,
      defaultCurrency,
      userCurrency: userCurrency || defaultCurrency
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
} 