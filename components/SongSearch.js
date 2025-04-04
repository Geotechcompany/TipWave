import React, { useState } from "react";
import { Search, Music, Clock, DollarSign } from "lucide-react";
import BidModal from "./BidModal";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import toast from 'react-hot-toast';

export function SongSearch({ onBidPlaced }) {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
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

  const fetchActiveBids = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        return data.activeBids;
      }
    } catch (error) {
      console.error("Error fetching active bids:", error);
    }
  };

  const handleBidSubmit = async (bidAmount) => {
    if (!user || !selectedSong) return;
    
    const bidPromise = new Promise(async (resolve, reject) => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/bids/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: bidAmount,
            song: selectedSong
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to place bid");
        }

        setIsBidModalOpen(false);
        if (onBidPlaced) {
          await onBidPlaced();
        }
        resolve("Bid placed successfully!");
      } catch (error) {
        console.error("Error placing bid:", error);
        reject(new Error("Failed to place bid. Please try again."));
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

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                      disabled={isSubmitting}
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
