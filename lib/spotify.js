import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let tokenExpirationTime = 0;

async function getValidToken() {
  if (Date.now() > tokenExpirationTime) {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    tokenExpirationTime = Date.now() + data.body['expires_in'] * 1000;
  }
  return spotifyApi.getAccessToken();
}

export const searchSpotify = async (query) => {
  try {
    await getValidToken();
    const result = await spotifyApi.searchTracks(query);
    return result.body.tracks.items;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    throw error;
  }
};

const getSpotifyAccessToken = async () => {
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
  return data.access_token;
};

export { getSpotifyAccessToken };

// Export the spotifyApi instance and getValidToken function
export { spotifyApi, getValidToken };
