import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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

    // Create song request document
    const songRequest = {
      userId: session.user.id,
      djId,
      songId: selectedTrack.id,
      songTitle: selectedTrack.name,
      songArtist: selectedTrack.artists,
      albumArt: selectedTrack.albumArt,
      amount: Number(amount),
      message,
      status: 'pending',
      createdAt: new Date()
    };

    // Insert into database
    const result = await db.collection('song_requests').insertOne(songRequest);

    // Return success response
    res.status(201).json({
      success: true,
      requestId: result.insertedId,
      message: 'Song request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating song request:', error);
    res.status(500).json({ error: 'Failed to create song request' });
  }
} 