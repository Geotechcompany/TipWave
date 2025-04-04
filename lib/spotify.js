import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let tokenExpirationTime = 0;
let currentToken = null;

const refreshAccessToken = async () => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    currentToken = data.access_token;
    tokenExpirationTime = Date.now() + ((data.expires_in - 60) * 1000); // Buffer of 60 seconds
    spotifyApi.setAccessToken(currentToken);
    return currentToken;
  } catch (error) {
    console.error('Error refreshing Spotify access token:', error);
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

const formatTrackResponse = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists[0].name,
  artists: track.artists,
  album: {
    name: track.album.name,
    images: track.album.images
  },
  duration_ms: track.duration_ms,
  explicit: track.explicit,
  albumArt: track.album.images[0]?.url || '/images/default-album-art.jpg'
});

export { spotifyApi };
