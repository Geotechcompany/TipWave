import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';


export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db();
      
      // Get data from request body
      const eventData = {
        ...req.body,
        createdAt: new Date(),
        djId: session.user.id,
      };
      
      // Insert the event into the database
      const result = await db.collection('events').insertOne(eventData);
      
      return res.status(201).json({ 
        success: true, 
        message: 'Event created successfully',
        eventId: result.insertedId 
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }
  } else if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db();
      
      // Query parameters
      const { djId, upcoming, past, limit = 10 } = req.query;
      
      // Build query
      const query = {};
      
      // If djId is provided, filter by DJ
      if (djId) {
        query.djId = djId;
      }
      
      // Filter by date if specified
      const now = new Date();
      if (upcoming === 'true') {
        query.date = { $gte: now };
      } else if (past === 'true') {
        query.date = { $lt: now };
      }
      
      // Get events from database
      const events = await db.collection('events')
        .find(query)
        .sort({ date: upcoming === 'true' ? 1 : -1 })
        .limit(parseInt(limit))
        .toArray();
      
      return res.status(200).json({ success: true, events });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 