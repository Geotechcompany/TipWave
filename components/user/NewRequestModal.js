import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Search, DollarSign, Loader2 } from "lucide-react";
import Image from "next/image";
import { searchTracksWithDebounce } from "@/lib/spotify";
import useDebounce from "@/hooks/useDebounce";

export function NewRequestModal({ isOpen, onClose, onSubmit, availableDJs }) {
  const [songSearch, setSongSearch] = useState("");
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");
  const [selectedDJ, setSelectedDJ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearch = useDebounce(songSearch, 500);

  useEffect(() => {
    const searchSpotify = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }
      
      setIsSearching(true);
      setError(null);
      
      try {
        const results = await searchTracksWithDebounce(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        setError('Failed to search songs. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchSpotify();
  }, [debouncedSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTrack || !selectedDJ) return;
    
    onSubmit({
      track: selectedTrack,
      djId: selectedDJ,
      amount,
      message
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Music className="text-blue-400" />
              New Song Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select DJ
                </label>
                <select
                  value={selectedDJ}
                  onChange={(e) => setSelectedDJ(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a DJ</option>
                  {availableDJs?.map(dj => (
                    <option key={dj._id} value={dj._id}>
                      {dj.name} - {dj.venue} {dj.rating && `(${dj.rating}⭐)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search for a Song
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter song name or artist..."
                    />
                  </div>
                  
                  <div className="min-h-[100px] bg-gray-900/50 rounded-lg border border-gray-800">
                    {isSearching ? (
                      <div className="flex justify-center items-center h-[100px]">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : songSearch.length > 0 ? (
                      searchResults.length > 0 ? (
                        <div className="max-h-[200px] overflow-y-auto p-2 space-y-2">
                          {searchResults.map(track => (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={track.id}
                              onClick={() => {
                                setSelectedTrack(track);
                                setSongSearch(`${track.name} - ${track.artists}`);
                                setSearchResults([]);
                              }}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors
                                ${selectedTrack?.id === track.id ? 'bg-gray-800 ring-1 ring-blue-500' : ''}`}
                            >
                              <Image
                                src={track.albumArt}
                                alt={track.name}
                                width={40}
                                height={40}
                                className="rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{track.name}</p>
                                <p className="text-xs text-gray-400 truncate">{track.artists}</p>
                              </div>
                              {selectedTrack?.id === track.id && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[100px] text-center p-4">
                          <Music className="h-8 w-8 text-gray-600 mb-2" />
                          <p className="text-sm text-gray-400">No songs found for "{songSearch}"</p>
                          <p className="text-xs text-gray-500">Try searching with a different term</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[100px] text-center p-4">
                        <Search className="h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-400">Start typing to search for songs</p>
                        <p className="text-xs text-gray-500">Enter at least 2 characters</p>
                      </div>
                    )}
                  </div>

                  {selectedTrack && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center gap-3"
                    >
                      <Image
                        src={selectedTrack.albumArt}
                        alt={selectedTrack.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedTrack.name}</p>
                        <p className="text-sm text-gray-400 truncate">{selectedTrack.artists}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrack(null);
                          setSongSearch('');
                        }}
                        className="p-1 hover:bg-gray-700 rounded-full"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bid Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a message to the DJ..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTrack || !selectedDJ}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
              >
                Submit Request
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 