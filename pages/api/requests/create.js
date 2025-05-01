import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { getWalletByUserId } from '@/lib/models/Wallet';
import { ObjectId } from 'mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract request data
    const { selectedTrack, djId, amount, message } = req.body;

    // Validate required fields
    if (!selectedTrack || !djId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user has sufficient wallet balance
    const userId = session.user.id;
    const requestAmount = parseFloat(amount);
    
    // Get wallet and check balance
    const wallet = await getWalletByUserId(userId);
    
    // Check if wallet exists and has sufficient balance
    if (!wallet || wallet.balance < requestAmount) {
      return res.status(400).json({ 
        error: 'Insufficient funds', 
        currentBalance: wallet?.balance || 0 
      });
    }
    
    // Get DJ info for notification
    const dj = await db.collection('users').findOne({ _id: new ObjectId(djId) });
    if (!dj) {
      return res.status(404).json({ error: 'DJ not found' });
    }

    // Start a MongoDB session for the transaction
    const mongoSession = client.startSession();
    let requestId;
    
    try {
      await mongoSession.withTransaction(async () => {
        // Deduct amount from user's wallet using our wallet model
        await db.collection('wallets').updateOne(
          { userId: new ObjectId(userId) },
          { 
            $inc: { balance: -requestAmount },
            $set: { updatedAt: new Date() }
          },
          { session: mongoSession }
        );
        
        // Create song request document
        const songRequest = {
          userId: session.user.id,
          djId,
          songId: selectedTrack.id,
          songTitle: selectedTrack.name,
          songArtist: selectedTrack.artists,
          albumArt: selectedTrack.albumArt,
          amount: requestAmount,
          message,
          status: 'pending',
          createdAt: new Date()
        };
        
        // Insert song request
        const result = await db.collection('song_requests').insertOne(
          songRequest, 
          { session: mongoSession }
        );
        requestId = result.insertedId;
        
        // Create transaction record
        await db.collection('transactions').insertOne({
          userId: new ObjectId(userId),
          type: 'request',
          songTitle: selectedTrack.name,
          amount: -requestAmount,
          relatedId: result.insertedId,
          djId: new ObjectId(djId),
          djName: dj.name,
          status: 'COMPLETED',
          description: `Song request: ${selectedTrack.name}`,
          createdAt: new Date()
        }, { session: mongoSession });
        
        // Create notification for the DJ
        await db.collection('notifications').insertOne({
          djId,
          userId: session.user.id,
          type: 'song_request',
          title: 'New Song Request',
          message: `New request for "${selectedTrack.name}" ($${amount})`,
          read: false,
          createdAt: new Date()
        }, { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }
    
    // Send notification email to DJ if they have an email
    if (dj.email) {
      try {
        await sendNotificationEmail({
          to: dj.email,
          type: EmailTypes.NEW_REQUEST,
          data: {
            djName: dj.name,
            userName: session.user.name || 'A user',
            songTitle: selectedTrack.name,
            amount: requestAmount
          }
        });
      } catch (emailError) {
        console.error('Failed to send DJ notification email:', emailError);
        // Continue processing even if email fails
      }
    }

    // Return success response
    res.status(201).json({
      success: true,
      requestId,
      message: 'Song request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating song request:', error);
    res.status(500).json({ error: 'Failed to create song request' });
  }
} 