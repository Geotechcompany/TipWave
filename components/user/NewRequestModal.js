import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Search, DollarSign, Loader2, Wallet } from "lucide-react";
import Image from "next/image";
import { searchTracksWithDebounce } from "@/lib/spotify";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { useCurrency } from "@/context/CurrencyContext";

export function NewRequestModal({ isOpen, onClose, onSubmit }) {
  const [songSearch, setSongSearch] = useState("");
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");
  const [selectedDJ, setSelectedDJ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add wallet balance states
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  
  // Add currency context
  const { formatCurrency, currency, isLoading: isCurrencyLoading } = useCurrency();
  
  const debouncedSearch = useDebounce(songSearch, 500);

  // New state variables for DJ loading
  const [availableDJs, setAvailableDJs] = useState([]);
  const [isDJsLoading, setIsDJsLoading] = useState(true);
  const [djsError, setDJsError] = useState(null);

  // Fetch wallet balance when modal opens
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingBalance(true);
        setBalanceError(null);
        
        // Changed from /api/user/wallet to /api/user/balance
        const response = await fetch('/api/user/balance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance');
        }
        
        const data = await response.json();
        setWalletBalance(data.balance || 0);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setBalanceError('Could not fetch your wallet balance');
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    fetchWalletBalance();
  }, []);

  // Fetch DJs with role "DJ" on component mount
  useEffect(() => {
    async function fetchDJs() {
      setIsDJsLoading(true);
      setDJsError(null);
      
      try {
        const response = await fetch('/api/djs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch DJs');
        }
        
        const data = await response.json();
        setAvailableDJs(data.djs);
      } catch (error) {
        console.error('Error fetching DJs:', error);
        setDJsError('Could not load DJs. Please try again.');
        toast.error('Failed to load DJs');
      } finally {
        setIsDJsLoading(false);
      }
    }
    
    if (isOpen) {
      fetchDJs();
    }
  }, [isOpen]);

  // Check if amount exceeds wallet balance
  const isAmountExceedingBalance = amount > walletBalance;

  useEffect(() => {
    const searchSpotify = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      
      try {
        const results = await searchTracksWithDebounce(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search songs:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchSpotify();
  }, [debouncedSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTrack || !selectedDJ) {
      return; // Button should be disabled already, but just in case
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the request data
      const requestData = {
        selectedTrack,
        djId: selectedDJ,
        amount,
        message
      };
      
      // Call the onSubmit prop function with the request data
      await onSubmit(requestData);
      
      // Reset form after successful submission
      setSelectedTrack(null);
      setSongSearch('');
      setMessage('');
      setAmount(5);
      
      // Success message handled by the parent component
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit song request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                {isDJsLoading ? (
                  <div className="flex items-center justify-center h-10 bg-gray-800 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                ) : djsError ? (
                  <div className="p-2 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                    {djsError}
                    <button 
                      type="button"
                      onClick={() => fetchDJs()}
                      className="ml-2 underline hover:text-red-300"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedDJ}
                    onChange={(e) => setSelectedDJ(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a DJ</option>
                    {availableDJs.map(dj => (
                      <option key={dj._id} value={dj._id}>
                        {dj.name}{dj.venueName ? ` - ${dj.venueName}` : ''}{dj.rating ? ` (${dj.rating}⭐)` : ''}
                      </option>
                    ))}
                  </select>
                )}
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
                          <p className="text-sm text-gray-400">No songs found for &quot;{songSearch}&quot;</p>
                          <p className="text-xs text-gray-500">Try searching with a different term</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[100px] text-center p-4">
                        <Search className="h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-400 mt-2">
                          Not seeing your favorite song? Try searching by artist name - song title
                        </p>
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
                  Bid Amount ({currency?.symbol || '$'})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`w-full pl-10 p-3 bg-gray-800 border ${
                      isAmountExceedingBalance ? 'border-red-600' : 'border-gray-700'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Amount"
                  />
                </div>
                
                <div className="mt-2 flex items-center text-sm">
                  <Wallet className="h-4 w-4 mr-1 text-gray-400" />
                  {isLoadingBalance || isCurrencyLoading ? (
                    <span className="text-gray-400 flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading balance...
                    </span>
                  ) : balanceError ? (
                    <span className="text-red-500">{balanceError}</span>
                  ) : (
                    <span className={`${isAmountExceedingBalance ? 'text-red-500' : 'text-gray-400'}`}>
                      Wallet balance: {formatCurrency(walletBalance)}
                      {isAmountExceedingBalance && ' (Insufficient funds)'}
                    </span>
                  )}
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
                disabled={!selectedTrack || !selectedDJ || isSubmitting || isAmountExceedingBalance}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 