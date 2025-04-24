import React, { useState, useEffect } from 'react';
import { Music, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import BidModal from './BidModal';
import toast from 'react-hot-toast';
// import { getSpotifyApi } from '../lib/spotify';

const DEFAULT_ALBUM_ART = '/images/default-album-art.jpg';

export function PopularSongs({ onBidPlaced }) {
  const [popularSongs, setPopularSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPopularSongs();
  }, []);

  const fetchPopularSongs = async () => {
    try {
      const response = await fetch('/api/songs/popular');
      if (!response.ok) throw new Error('Failed to fetch popular songs');
      
      const data = await response.json();
      
      // Fetch current Spotify data for each song
      const songsWithSpotifyData = await Promise.all(
        data.map(async (song) => {
          try {
            const spotifyResponse = await fetch(`/api/songs/spotify?id=${song.spotifyId}`);
            if (spotifyResponse.ok) {
              const spotifyData = await spotifyResponse.json();
              return {
                ...song,
                albumArt: spotifyData.album.images[0]?.url || DEFAULT_ALBUM_ART,
                name: spotifyData.name,
                artist: spotifyData.artists[0].name,
                explicit: spotifyData.explicit
              };
            }
            return song;
          } catch (error) {
            console.error('Error fetching Spotify data:', error);
            return song;
          }
        })
      );

      setPopularSongs(songsWithSpotifyData);
    } catch (error) {
      console.error('Error fetching popular songs:', error);
      toast.error('Failed to load popular songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBidClick = (song) => {
    setSelectedSong(song);
    setIsBidModalOpen(true);
  };

  const handleBidSubmit = async (amount) => {
    setIsSubmitting(true);
    
    const bidPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/bids/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, song: selectedSong })
        });

        if (!response.ok) {
          throw new Error('Failed to place bid');
        }

        setIsBidModalOpen(false);
        if (onBidPlaced) {
          await onBidPlaced();
        }
        resolve('Bid placed successfully!');
      } catch (error) {
        console.error('Error placing bid:', error);
        reject(new Error('Failed to place bid. Please try again.'));
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(bidPromise, {
      loading: 'Placing your bid...',
      success: 'Bid placed successfully! 🎵',
      error: 'Failed to place bid 😟'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        Popular Songs
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularSongs.map((song) => (
          <div key={song._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={song.albumArt || DEFAULT_ALBUM_ART}
                alt={song.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                {song.title}
                {song.explicit && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                    Explicit
                  </span>
                )}
              </h3>
              <p className="text-gray-600 mb-4">{song.artist}</p>
              <button
                onClick={() => handleBidClick(song)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Music className="h-4 w-4" />
                Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {isBidModalOpen && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          onSubmit={handleBidSubmit}
          song={selectedSong}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default PopularSongs; 