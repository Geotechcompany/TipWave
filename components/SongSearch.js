import React, { useState } from "react";
import { Search, Music, Clock, DollarSign } from "lucide-react";
import BidModal from "./BidModal";
import Image from "next/image";

const SongSearch = () => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `/api/songs/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Error searching songs:", error);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const handleBidClick = (song) => {
    setSelectedSong(song);
    setIsBidModalOpen(true);
  };

  const handleBidSubmit = (bidAmount) => {
    // Here you would typically send the bid to your backend
    console.log(`Bid of ${bidAmount} placed for song: ${selectedSong.name}`);
    setIsBidModalOpen(false);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
          className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <Search size={20} />
        </button>
      </div>

      {songs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  #
                </th>
                <th scope="col" className="px-6 py-3">
                  Cover
                </th>
                <th scope="col" className="px-6 py-3">
                  Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Artist
                </th>
                <th scope="col" className="px-6 py-3">
                  Album
                </th>
                <th scope="col" className="px-6 py-3">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3">
                  Bid
                </th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr
                  key={song.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <Image
                      src={
                        song.album.images[2]?.url ||
                        "https://via.placeholder.com/64"
                      }
                      alt={song.album.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {song.name}
                    {song.explicit && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Explicit
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {song.artists.map((artist) => artist.name).join(", ")}
                  </td>
                  <td className="px-6 py-4">{song.album.name}</td>
                  <td className="px-6 py-4">
                    {formatDuration(song.duration_ms)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleBidClick(song)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <DollarSign size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleBidSubmit}
        currentBid={0}
        selectedSong={selectedSong}
      />
    </div>
  );
};

export default SongSearch;
