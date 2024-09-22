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
