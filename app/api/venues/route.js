import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'; // Adjust this import based on your actual database setup

export async function POST(request) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const venueData = await request.json();
    
    // Basic validation
    if (!venueData.name || !venueData.address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    // Create the venue in the database
    // NOTE: Adjust this based on your actual database implementation
    const venue = await db.venue.create({
      data: {
        name: venueData.name,
        address: venueData.address,
        capacity: parseInt(venueData.capacity) || 0,
        website: venueData.website || '',
        description: venueData.description || '',
        contactEmail: venueData.contactEmail || '',
        contactPhone: venueData.contactPhone || '',
        user: { connect: { id: session.user.id } }, // Link venue to user
        createdBy: session.user.name
      }
    });

    return NextResponse.json({ 
      message: 'Venue created successfully', 
      venue 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
} 