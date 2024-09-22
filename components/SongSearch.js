import React, { useState } from 'react';
import axios from 'axios';

const SongSearch = ({ onBid, currency }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/songs/search?query=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
          className="flex-grow p-2 rounded-l-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-neon-blue text-white p-2 rounded-r-lg"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((song) => (
            <li key={song.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
              <div>
                <p className="font-bold">{song.name}</p>
                <p className="text-sm text-gray-400">{song.artists[0].name}</p>
              </div>
              <button
                onClick={() => onBid(song)}
                className="bg-neon-pink text-white p-2 rounded"
              >
                Bid
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongSearch;