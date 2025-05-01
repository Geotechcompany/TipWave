import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Clock, PlusCircle, Loader2 } from "lucide-react";
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
              className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              {/* Album Art */}
              <div className="h-16 w-16 relative rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={request.albumArt || DEFAULT_ALBUM_ART}
                  alt={request.songTitle}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{request.songTitle}</h3>
                <p className="text-sm text-gray-400 truncate">{request.songArtist}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-blue-400 text-sm">
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
              
              {/* Request Time & DJ */}
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {request.djName || 'Unknown DJ'}
                </p>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  {request.createdAt && 
                    formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })
                  }
                </div>
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
    </div>
  );
} 