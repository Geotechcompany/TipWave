import { spotifyApi, getValidToken } from '../../../lib/spotify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await getValidToken();

    // Search for trending/popular songs instead of accessing a specific playlist
    const result = await spotifyApi.searchTracks('genre:pop year:2024', {
      limit: 10,
      market: 'US',
      sort: 'popularity'
    });

    if (!result?.body?.tracks?.items) {
      throw new Error('Invalid response structure');
    }

    const popularSongs = result.body.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      artist: track.artists[0].name,
      album: {
        name: track.album.name,
        images: track.album.images
      },
      albumArt: track.album.images[0]?.url,
      duration_ms: track.duration_ms,
      popularity: track.popularity
    }));

    res.status(200).json(popularSongs);
  } catch (error) {
    console.error('Error fetching popular songs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular songs',
      details: error.message 
    });
  }
} 