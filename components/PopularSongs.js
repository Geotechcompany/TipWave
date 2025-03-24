import React, { useState, useEffect } from 'react';
import { Music, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export const PopularSongs = ({ onBidClick }) => {
  const [popularSongs, setPopularSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const response = await fetch('/api/songs/popular');
        if (response.ok) {
          const data = await response.json();
          setPopularSongs(data);
        }
      } catch (error) {
        console.error('Error fetching popular songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularSongs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-500" />
        <h2 className="text-xl font-semibold">Popular Songs</h2>
      </div>
      <div className="space-y-4">
        {popularSongs.map((song) => (
          <div
            key={song.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src={song.albumArt || 'https://res.cloudinary.com/dgvnuwspr/image/upload/v1711276561/default-album_kqfkc3.png'}
                  alt={song.album?.name || 'Album Art'}
                  fill
                  className="rounded-md object-cover"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/dgvnuwspr/image/upload/v1711276561/default-album_kqfkc3.png';
                  }}
                />
              </div>
              <div>
                <h3 className="font-medium">{song.name}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
              </div>
            </div>
            <button
              onClick={() => onBidClick(song)}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Music size={16} />
              <span>Bid</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularSongs; 