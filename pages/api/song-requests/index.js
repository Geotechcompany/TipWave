import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
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
    const users = db.collection('users');
    const userId = session.user.id;
    const requestAmount = parseFloat(amount);
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    
    // Check if wallet exists and has sufficient balance
    if (!user.wallet || user.wallet < requestAmount) {
      return res.status(400).json({ 
        error: 'Insufficient funds', 
        currentBalance: user.wallet || 0 
      });
    }
    
    // Get DJ info for notification
    const dj = await users.findOne({ _id: new ObjectId(djId) });
    if (!dj) {
      return res.status(404).json({ error: 'DJ not found' });
    }

    // Start a MongoDB session for the transaction
    const mongoSession = client.startSession();
    let requestId;
    
    try {
      await mongoSession.withTransaction(async () => {
        // Deduct amount from user's wallet
        await users.updateOne(
          { _id: new ObjectId(userId) },
          { $inc: { wallet: -requestAmount } },
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
      });
    } finally {
      await mongoSession.endSession();
    }

    // Send email notifications
    try {
      // Send confirmation email to user
      await sendNotificationEmail({
        type: EmailTypes.SONG_REQUEST_CONFIRMATION,
        recipient: user.email,
        data: {
          userName: user.name,
          songTitle: selectedTrack.name,
          songArtist: selectedTrack.artists,
          djName: dj.name,
          amount: requestAmount,
          date: new Date().toLocaleDateString()
        }
      });
      
      // Send notification email to DJ
      await sendNotificationEmail({
        type: EmailTypes.NEW_SONG_REQUEST,
        recipient: dj.email,
        data: {
          djName: dj.name,
          userName: user.name,
          songTitle: selectedTrack.name,
          songArtist: selectedTrack.artists,
          amount: requestAmount,
          message: message || 'No message',
          date: new Date().toLocaleDateString()
        }
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Error sending notification emails:', emailError);
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