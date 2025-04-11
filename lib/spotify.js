import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let tokenExpirationTime = 0;
let currentToken = null;

const refreshAccessToken = async () => {
  try {
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to refresh token');
    }

    const data = await response.json();
    currentToken = data.access_token;
    tokenExpirationTime = Date.now() + ((data.expires_in - 60) * 1000);
    spotifyApi.setAccessToken(currentToken);
    return currentToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const getValidToken = async () => {
  if (!currentToken || Date.now() >= tokenExpirationTime) {
    await refreshAccessToken();
  }
  return currentToken;
};

export const searchTracks = async (query) => {
  await getValidToken();
  const response = await spotifyApi.searchTracks(query, { limit: 10 });
  return response.body.tracks.items.map(formatTrackResponse);
};

export const searchTracksWithDebounce = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    await getValidToken();
    const response = await spotifyApi.searchTracks(query, { 
      limit: 5,
      market: 'US' 
    });
    
    return response.body.tracks.items.map(formatTrackResponse);
  } catch (error) {
    console.error('Error searching tracks:', error);
    // Return empty array instead of throwing to handle gracefully in UI
    return [];
  }
};

const formatTrackResponse = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists[0].name,
  artists: track.artists.map(a => a.name).join(', '),
  album: {
    name: track.album.name,
    images: track.album.images
  },
  duration_ms: track.duration_ms,
  explicit: track.explicit,
  albumArt: track.album.images[0]?.url || '/placeholder-album.png',
  previewUrl: track.preview_url
});

export { spotifyApi };
