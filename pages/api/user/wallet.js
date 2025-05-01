import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getOrCreateWallet } from '@/lib/models/Wallet';


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get or create wallet for this user
    const wallet = await getOrCreateWallet(session.user.id);
    
    // Return the wallet balance
    return res.status(200).json({ 
      balance: wallet.balance || 0,
      currency: wallet.currency || 'USD'
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
} 