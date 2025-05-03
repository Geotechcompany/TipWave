import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Clock, PlusCircle, Loader2, XCircle, AlertTriangle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { NewRequestModal } from "./NewRequestModal";
import toast from "react-hot-toast";
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_ALBUM_ART } from '@/utils/constants';
import { useCurrency } from '@/context/CurrencyContext';

export function MyRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, exchangeRates, isLoading: isCurrencyLoading } = useCurrency();
  const [djs, setDjs] = useState({});
  const [loadingDjs, setLoadingDjs] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });

  // Fetch user requests
  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/requests');
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again.');
      toast.error('Could not load your requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests on component mount and when modal closes
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleNewRequest = async (requestData) => {
    try {
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      toast.success('Song request submitted successfully!');
      setIsModalOpen(false);
      
      // Refresh the requests after successful submission
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  // Filter to show only active requests
  const activeRequests = requests.filter(r => 
    r.status === "pending" || r.status === "accepted"
  );

  // Function to convert amounts to the selected currency
  const convertAmount = (amount) => {
    if (!amount || isCurrencyLoading || !currency || !exchangeRates) {
      return amount;
    }
    
    // Assuming amounts are stored in USD by default
    const baseAmount = parseFloat(amount);
    if (isNaN(baseAmount)) return amount;
    
    const rate = exchangeRates[currency.code] || 1;
    const convertedAmount = baseAmount * rate;
    
    return convertedAmount.toFixed(2);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    if (!currency) return '$';
    return currency.symbol || currency.code;
  };

  // Add this function to fetch DJ information
  const fetchDjInfo = async (djIds) => {
    if (!djIds.length) return;
    
    setLoadingDjs(true);
    try {
      const response = await fetch(`/api/djs/info?ids=${djIds.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch DJ information');
      }
      
      const data = await response.json();
      
      // Create a map of DJ IDs to names
      const djMap = {};
      data.djs.forEach(dj => {
        djMap[dj._id] = dj.name || dj.username || 'Unnamed DJ';
      });
      
      setDjs(djMap);
    } catch (error) {
      console.error('Error fetching DJ info:', error);
    } finally {
      setLoadingDjs(false);
    }
  };

  // Update the getDjName function to use loadingDjs
  const getDjName = (request) => {
    if (!request.djId) return 'No DJ Assigned';
    if (loadingDjs && !djs[request.djId]) return 'Loading DJ...';
    return djs[request.djId] || request.djName || 'Unknown DJ';
  };

  // Add this useEffect to fetch DJ info when requests change
  useEffect(() => {
    if (requests.length > 0) {
      // Get unique DJ IDs from requests
      const djIds = [...new Set(requests
        .filter(req => req.djId)
        .map(req => req.djId))];
      
      if (djIds.length > 0) {
        fetchDjInfo(djIds);
      }
    }
  }, [requests]);

  // Add the function to show toast notifications
  const showBannerToast = (message, type = 'success') => {
    setBannerToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setBannerToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Add the function to handle request cancellation
  const handleCancelRequest = async (requestId) => {
    setCancellingId(requestId);
    
    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      // Show success message and refresh the requests
      showBannerToast('Song request cancelled successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      showBannerToast('Failed to cancel request. Please try again.', 'error');
    } finally {
      setCancellingId(null);
      setShowConfirmation(false);
      setRequestToCancel(null);
    }
  };

  // Update the ConfirmationDialog component for better mobile support
  const ConfirmationDialog = ({ isOpen, onClose, onConfirm, request }) => {
    if (!isOpen || !request) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-5 sm:p-6 max-w-md w-full border border-gray-700">
          <h3 className="text-base sm:text-lg font-medium mb-2">Cancel Song Request</h3>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Are you sure you want to cancel your request for &ldquo;{request.songTitle}&rdquo; by {request.songArtist}?
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
            >
              Keep Request
            </button>
            <button
              onClick={() => onConfirm(request._id)}
              className="w-full sm:w-auto order-1 sm:order-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-sm"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">My Requests</h2>
          <p className="text-gray-400">Your current song requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchRequests(); // Refresh after closing
        }}
        onSubmit={handleNewRequest}
      />

      {/* Requests List */}
      {isLoading || isCurrencyLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button 
            onClick={fetchRequests}
            className="text-sm underline text-red-300 hover:text-red-200"
          >
            Try Again
          </button>
        </div>
      ) : activeRequests.length > 0 ? (
        <div className="space-y-4">
          {activeRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              {/* Album Art - Responsive sizing */}
              <div className="h-14 w-14 sm:h-16 sm:w-16 relative rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={request.albumArt || DEFAULT_ALBUM_ART}
                  alt={request.songTitle}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Song Info - Modified for better mobile layout */}
              <div className="flex-1 min-w-0 w-full">
                <h3 className="font-medium truncate">{request.songTitle}</h3>
                <p className="text-sm text-gray-400 truncate">{request.songArtist}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-blue-400 text-sm whitespace-nowrap">
                    {getCurrencySymbol()}{convertAmount(request.amount)}
                    {currency && currency.code !== 'USD' && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({currency.code})
                      </span>
                    )}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    request.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                    request.status === 'accepted' ? 'bg-green-900/30 text-green-300' :
                    request.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                    'bg-blue-900/30 text-blue-300'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Request Time & DJ - Improved for mobile */}
              <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
                <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="truncate max-w-[120px]">{getDjName(request)}</span>
                  <span className="hidden sm:inline-block mx-1">•</span>
                  <span className="whitespace-nowrap">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                </div>
                
                {/* Cancel button - Responsive improvements */}
                {request.status === 'pending' && (
                  <button
                    onClick={() => {
                      setRequestToCancel(request);
                      setShowConfirmation(true);
                    }}
                    disabled={cancellingId === request._id}
                    className="mt-2 text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full 
                             hover:bg-red-500/20 transition-colors duration-200 flex items-center 
                             space-x-1 border border-red-500/20 w-full sm:w-auto justify-center sm:justify-start"
                  >
                    {cancellingId === request._id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Cancel Request</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Music className="h-12 w-12 mx-auto text-gray-700 mb-3" />
          <h3 className="text-lg font-medium mb-1">No active requests</h3>
          <p className="text-gray-500 mb-4">Create your first song request to get started</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
          >
            Make a Request
          </button>
        </div>
      )}

      {/* Improve the confirmation dialog for mobile */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleCancelRequest}
        request={requestToCancel}
      />

      {/* Banner Toast */}
      {bannerToast.show && (
        <div className={`fixed top-16 right-4 left-4 md:left-auto md:w-96 p-4 rounded-lg shadow-lg z-50 
                       ${bannerToast.type === 'success' 
                         ? 'bg-green-600 text-white' 
                         : 'bg-red-600 text-white'} 
                       transform transition-all duration-300 ease-in-out`}
             style={{ animation: 'slide-in-right 0.5s ease-out' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {bannerToast.type === 'success' 
                ? <CheckCircle className="h-5 w-5 mr-2" /> 
                : <AlertTriangle className="h-5 w-5 mr-2" />}
              <p className="font-medium">{bannerToast.message}</p>
            </div>
            <button 
              onClick={() => setBannerToast({ show: false, message: '', type: '' })}
              className="ml-4 text-white/80 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 