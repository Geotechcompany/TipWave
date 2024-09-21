// lib/spotify.js
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export const searchSpotify = async (query) => {
  try {
    await spotifyApi.clientCredentialsGrant();
    const result = await spotifyApi.searchTracks(query);
    return result.body.tracks.items;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    throw error;
  }
};

// pages/api/songs/search.js
import { requireAuth } from '../../../lib/auth';
import { searchSpotify } from '../../../lib/spotify';

export default async function handler(req, res) {
  if (!(await requireAuth(req, res))) return;

  if (req.method === 'GET') {
    const { query } = req.query;
    try {
      const songs = await searchSpotify(query);
      res.status(200).json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Error searching songs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}