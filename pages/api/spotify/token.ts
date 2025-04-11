import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Spotify API error:', data);
      throw new Error(data.error_description || 'Failed to get Spotify token');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Token error:', error);
    res.status(500).json({ 
      error: 'Failed to get access token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 