import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Music, Search,  Loader2, Wallet, 
  CheckCircle, AlertTriangle, Info, ArrowRight 
} from "lucide-react";
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
  
  // Add duplicate check states
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [duplicateRequest, setDuplicateRequest] = useState(null);
  const [hasConfirmedDuplicate, setHasConfirmedDuplicate] = useState(false);
  
  // Add confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Add currency context
  const { formatCurrency, currency, isLoading: isCurrencyLoading } = useCurrency();
  
  const debouncedSearch = useDebounce(songSearch, 500);

  // New state variables for DJ loading
  const [availableDJs, setAvailableDJs] = useState([]);
  const [isDJsLoading, setIsDJsLoading] = useState(true);
  const [djsError, setDJsError] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success' // 'success', 'error', or 'info'
  });

  // Add a submit lock ref that persists across renders
  const submitLockRef = useRef(false);
  
  // Store the last search results for comparison
  const lastSearchRef = useRef("");

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ visible: true, message, type });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Fetch wallet balance when modal opens
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingBalance(true);
        setBalanceError(null);
        
        // Add a timestamp to prevent caching
        const response = await fetch(`/api/wallet/balance?t=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance');
        }
        
        const data = await response.json();
        setWalletBalance(parseFloat(data.balance || 0));
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setBalanceError('Could not load wallet balance');
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    if (isOpen) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  // Real-time balance check when amount changes
  const isAmountExceedingBalance = Number(amount) > Number(walletBalance);

  // Fetch DJs when modal opens
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

  // Spotify track search
  useEffect(() => {
    const searchSpotify = async () => {
      if (debouncedSearch.length < 2 || debouncedSearch === lastSearchRef.current) {
        return;
      }
      
      lastSearchRef.current = debouncedSearch;
      setIsSearching(true);
      
      try {
        const results = await searchTracksWithDebounce(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search songs:', error);
        setSearchResults([]);
        showNotification('Failed to search songs. Please try again.', 'error');
      } finally {
        setIsSearching(false);
      }
    };

    searchSpotify();
  }, [debouncedSearch]);

  // Check for duplicate requests when DJ and track are selected
  useEffect(() => {
    const checkDuplicateRequest = async () => {
      if (!selectedDJ || !selectedTrack) {
        setDuplicateRequest(null);
        return;
      }
      
      setIsDuplicateChecking(true);
      
      try {
        const response = await fetch('/api/requests/check-duplicate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            djId: selectedDJ,
            trackId: selectedTrack.id
          }),
        });
        
        const data = await response.json();
        
        if (data.isDuplicate) {
          setDuplicateRequest({
            ...data.request,
            timeAgo: data.timeAgo
          });
        } else {
          setDuplicateRequest(null);
        }
      } catch (error) {
        console.error('Error checking for duplicate requests:', error);
        // Don't show an error notification for this as it's not critical
      } finally {
        setIsDuplicateChecking(false);
      }
    };
    
    checkDuplicateRequest();
  }, [selectedDJ, selectedTrack]);

  // Reset the form completely when the modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all form state when modal is closed
      setSelectedTrack(null);
      setSongSearch('');
      setAmount(5);
      setMessage('');
      setSelectedDJ('');
      setIsSubmitting(false);
      setDuplicateRequest(null);
      setHasConfirmedDuplicate(false);
      setShowConfirmation(false);
      // Reset the submit lock
      submitLockRef.current = false;
    }
  }, [isOpen]);

  // Function to prepare submission
  const prepareSubmission = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!selectedTrack || !selectedDJ) {
      showNotification('Please select both a DJ and a song', 'error');
      return;
    }
    
    // Check wallet balance
    if (isAmountExceedingBalance) {
      showNotification('Insufficient funds. Please add money to your wallet.', 'error');
      return;
    }
    
    // If it's a duplicate request and not confirmed, show warning
    if (duplicateRequest && !hasConfirmedDuplicate) {
      setHasConfirmedDuplicate(true);
      showNotification(
        `This song was already requested ${duplicateRequest.timeAgo}. Do you still want to request it again?`, 
        'info'
      );
      return;
    }
    
    // If amount is high, show confirmation
    if (amount > 20 && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    // Proceed with submission
    handleSubmit();
  };

  // Handle actual submission
  const handleSubmit = async () => {
    // Triple protection against multiple submissions
    if (submitLockRef.current || isSubmitting) {
      console.log('Submission blocked - already processing');
      return;
    }
    
    // Set both locks to prevent any possibility of double submission
    submitLockRef.current = true;
    setIsSubmitting(true);
    
    try {
      // Format data as expected by the API
      const requestData = {
        selectedTrack: {
          id: selectedTrack.id,
          name: selectedTrack.name,
          artists: selectedTrack.artists,
          albumArt: selectedTrack.albumArt || selectedTrack.album?.images?.[0]?.url
        },
        djId: selectedDJ,
        amount: Number(amount),
        message: message || '',
        isDuplicate: !!duplicateRequest,
        confirmedDuplicate: hasConfirmedDuplicate
      };
      
      // Create AbortController for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      // Use the song-requests endpoint
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request');
      }
      
      // Show success notification
      showNotification('Song request sent successfully!', 'success');
      toast.success('Song request sent successfully!');
      
      // Close modal on success after a brief delay
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(requestData);
        }
        onClose(); // This will trigger the useEffect that resets the form
      }, 1500);
    } catch (error) {
      console.error('Error creating song request:', error);
      
      if (error.name === 'AbortError') {
        showNotification('Request timed out. Please try again.', 'error');
      } else if (error.message.includes('Insufficient funds')) {
        showNotification('Insufficient funds. Please add money to your wallet.', 'error');
      } else {
        showNotification(error.message || 'Failed to send song request', 'error');
      }
      
      // Only reset the locks on error, not on success
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Music className="text-blue-400" />
              New Song Request
            </h2>

            {/* Notification Banner */}
            <AnimatePresence>
              {notification.visible && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    absolute top-0 left-0 right-0 p-3 rounded-t-2xl flex items-center justify-between z-60
                    ${notification.type === 'success' ? 'bg-green-600' : 
                      notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white
                  `}
                >
                  <div className="flex items-center">
                    {notification.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : notification.type === 'error' ? (
                      <AlertTriangle className="h-5 w-5 mr-2" />
                    ) : (
                      <Info className="h-5 w-5 mr-2" />
                    )}
                    <p className="font-medium">{notification.message}</p>
                  </div>
                  <button 
                    onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                    className="p-1 hover:bg-white/20 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={prepareSubmission} className="space-y-6">
              {/* DJ Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select DJ
                </label>
                {isDJsLoading ? (
                  <div className="flex items-center justify-center h-12 bg-gray-800/60 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                ) : djsError ? (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
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
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

              {/* Song Search */}
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white
                                 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter song name or artist..."
                    />
                  </div>
                  
                  {/* Search Results */}
                  <div className="min-h-[100px] bg-gray-800/40 rounded-lg border border-gray-700 overflow-hidden">
                    {isSearching ? (
                      <div className="flex justify-center items-center h-[100px]">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : songSearch.length > 0 ? (
                      searchResults.length > 0 ? (
                        <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          <AnimatePresence>
                            {searchResults.map((track, index) => (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                key={track.id}
                                onClick={() => {
                                  setSelectedTrack(track);
                                  setSongSearch(`${track.name} - ${track.artists}`);
                                  setSearchResults([]);
                                }}
                                className={`flex items-center gap-3 p-3 border-b border-gray-700 last:border-0 cursor-pointer 
                                  hover:bg-gray-700 transition-colors
                                  ${selectedTrack?.id === track.id ? 'bg-blue-900/30 ring-1 ring-blue-500' : ''}`}
                              >
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <Image
                                    src={track.albumArt}
                                    alt={track.name}
                                    width={48}
                                    height={48}
                                    className="rounded object-cover"
                                    loading="eager"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{track.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{track.artists}</p>
                                </div>
                                {selectedTrack?.id === track.id && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
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
                          Search for your favorite song
                        </p>
                        <p className="text-xs text-gray-500">Enter at least 2 characters</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Track */}
                  <AnimatePresence>
                    {selectedTrack && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50 flex items-center gap-3"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={selectedTrack.albumArt}
                            alt={selectedTrack.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
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
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Duplicate Warning */}
                  <AnimatePresence>
                    {isDuplicateChecking ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          <p className="text-sm text-blue-200">Checking for duplicate requests...</p>
                        </div>
                      </motion.div>
                    ) : duplicateRequest && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg"
                      >
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-amber-200">
                              This song was already requested <span className="font-medium">{duplicateRequest.timeAgo}</span>
                            </p>
                            <p className="text-xs text-amber-300/70 mt-1">
                              You can still request it again, but the DJ may already have it in their queue.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bid Amount ({currency?.symbol || currency?.code || 'KSh'})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isCurrencyLoading ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <span className="text-gray-400 font-medium text-lg">
                        {currency?.symbol || '$'}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`w-full pl-10 p-3 bg-gray-800/60 border transition-colors
                      ${isAmountExceedingBalance ? 'border-red-600 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'} 
                      rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
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

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 bg-gray-800/60 border border-gray-700 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                             min-h-[80px] resize-y"
                  placeholder="Add a message to the DJ..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedTrack || !selectedDJ || isSubmitting || isAmountExceedingBalance}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                         hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800
                         disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg font-medium 
                         transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            
            {/* Confirmation Dialog */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={(e) => e.target === e.currentTarget && cancelConfirmation()}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gray-800 rounded-xl border border-gray-700 p-5 w-full max-w-md mx-4"
                  >
                    <h3 className="text-lg font-bold mb-3">Confirm High Bid Request</h3>
                    <p className="text-gray-300 mb-4">
                      You&apos;re about to bid <span className="font-bold text-white">{formatCurrency(amount)}</span> for this song request. 
                      Are you sure you want to proceed?
                    </p>
                    
                    <div className="flex gap-3 mt-5">
                      <button
                        type="button"
                        onClick={cancelConfirmation}
                        className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 
                                  rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 
                                  rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Confirm Bid</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 