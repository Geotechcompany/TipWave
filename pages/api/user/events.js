import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    console.log('User ID for events query:', session.user.id);

    // Get upcoming events that the user is attending or interested in (or are just upcoming events)
    const events = await db.collection('events')
      .find({ 
        $or: [
          { attendees: session.user.id },
          { interestedUsers: session.user.id },
          { status: "upcoming" } // Remove the additional djId condition to see all upcoming events
        ]
      })
      .sort({ date: 1, startDate: 1 }) // Reversed the order since date seems to be the primary field
      .limit(5)
      .toArray();

    console.log('Events found in database:', events.length, events);

    // Debug the user ID to check if it matches the format in the database
    console.log('User ID format check:', { 
      sessionUserId: session.user.id,
      exampleDjId: "user_2nvSg8HLvvMW2kV3CjmH1XZaIs" // From your screenshot
    });

    res.status(200).json({
      events: events.map(event => ({
        _id: event._id.toString(),
        title: event.title || event.name, // Some records might use name instead of title
        description: event.description,
        startDate: event.startDate || event.date, // Handle both date formats
        endDate: event.endDate,
        location: event.location,
        djId: event.djId || event.djid, // Handle possible case differences
        djName: event.djName,
        imageUrl: event.imageUrl,
        status: event.status
      }))
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
} 