import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';
import { getWalletByUserId } from '@/lib/models/Wallet';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Check authentication using NextAuth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, song } = req.body;

    if (!amount || !song) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if user has sufficient wallet balance using the wallets collection
    const userId = session.user.id;
    const bidAmount = parseFloat(amount);
    
    // Get wallet and check balance
    const wallet = await getWalletByUserId(userId);
    
    // Check if wallet exists and has sufficient balance
    if (!wallet || wallet.balance < bidAmount) {
      return res.status(400).json({ 
        error: 'Insufficient funds', 
        currentBalance: wallet?.balance || 0 
      });
    }
    
    // Store song first
    const songs = db.collection('songs');
    
    // Check if song already exists
    let songDoc = await songs.findOne({ spotifyId: song.id });
    
    if (!songDoc) {
      // Create new song with Spotify data
      const newSong = {
        spotifyId: song.id,
        title: song.name,
        artist: song.artists.map(a => a.name).join(', '),
        album: song.album.name,
        albumArt: song.album.images[0]?.url || '/images/default-album-art.jpg',
        duration_ms: song.duration_ms,
        explicit: song.explicit || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await songs.insertOne(newSong);
      songDoc = { _id: result.insertedId, ...newSong };
    }

    // Start a session for transaction
    const mongoSession = client.startSession();
    
    let bidResult;
    
    try {
      await mongoSession.withTransaction(async () => {
        // Deduct amount from wallet
        await db.collection('wallets').updateOne(
          { userId: new ObjectId(userId) },
          { 
            $inc: { balance: -bidAmount },
            $set: { updatedAt: new Date() }
          },
          { session: mongoSession }
        );
        
        // Create bid
        const bids = db.collection('bids');
        const newBid = {
          userId: userId,
          amount: bidAmount,
          songId: songDoc._id,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        bidResult = await bids.insertOne(newBid, { session: mongoSession });
        
        // Create transaction record
        const transactions = db.collection('transactions');
        await transactions.insertOne({
          userId: new ObjectId(userId),
          type: 'bid',
          songTitle: song.name,
          amount: -bidAmount,
          relatedId: bidResult.insertedId,
          status: 'COMPLETED',
          description: `Bid for song: ${song.name}`,
          createdAt: new Date()
        }, { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    const userEmail = session.user.email;
    
    // Send email notification about the bid
    try {
      await sendNotificationEmail({
        to: userEmail,
        type: EmailTypes.BID_CREATED,
        data: {
          userName: session.user.name || userEmail.split('@')[0],
          songTitle: song.name,
          artistName: song.artists.map(a => a.name).join(', '),
          bidAmount: amount
        }
      });
    } catch (emailError) {
      console.error('Failed to send bid notification email:', emailError);
      // Continue processing even if email fails
    }

    return res.status(200).json({
      success: true,
      bid: bidResult.insertedId,
      message: 'Bid created successfully'
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Failed to create bid' });
  }
} 