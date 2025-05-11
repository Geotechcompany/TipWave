import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music,  Clock, User, Loader2, 
  AlertCircle, RefreshCw, CheckCircle, XCircle, X 
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function RequestsPanel({ defaultCurrency, onRequestsUpdate }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingStates, setActionLoadingStates] = useState({});
  const [notification, setNotification] = useState(null);

  const formatCurrency = useCallback((amount) => {
    return `${defaultCurrency?.symbol || '$'}${parseFloat(amount || 0).toFixed(2)}`;
  }, [defaultCurrency]);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching ${activeTab} requests for DJ ID:`, session.user.id);
      
      // Use the working endpoint directly with better error handling
      const response = await fetch(`/api/dj/${session.user.id}/requests?status=${activeTab}`);
      
      if (!response.ok) {
        console.error(`Error response from API: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw API response:", data);
      
      // Check if the data is in the expected format
      if (Array.isArray(data)) {
        console.log(`Successfully fetched ${data.length} requests`);
        setRequests(data);
      } else {
        console.log("Data is not an array, trying to extract requests from object:", data);
        setRequests(data.requests || data.data?.requests || []);
      }
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again.');
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoadingStates(prev => ({ ...prev, [requestId]: 'accepting' }));
      
      const response = await fetch(`/api/dj/${session.user.id}/requests/${requestId}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept request');
      }
      
      // Show popup notification
      setNotification({
        type: 'success',
        message: 'Request accepted successfully',
        subMessage: 'Earnings have been added to your wallet',
        icon: <CheckCircle className="h-5 w-5" />,
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        textColor: 'text-green-400'
      });

      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      
      // Rest of the success handling...
      const acceptEvent = new CustomEvent('request-accepted');
      window.dispatchEvent(acceptEvent);
      if (onRequestsUpdate) onRequestsUpdate();
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to accept request',
        subMessage: 'Please try again',
        icon: <AlertCircle className="h-5 w-5" />,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-400'
      });
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [requestId]: undefined }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setActionLoadingStates(prev => ({ ...prev, [requestId]: 'rejecting' }));
      
      const response = await fetch(`/api/dj/${session.user.id}/requests/${requestId}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject request');
      }
      
      setNotification({
        type: 'info',
        message: 'Request rejected',
        subMessage: 'Funds have been returned to the requester',
        icon: <XCircle className="h-5 w-5" />,
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        textColor: 'text-gray-400'
      });

      setTimeout(() => setNotification(null), 5000);
      
      fetchRequests();
      if (typeof onRequestsUpdate === 'function') {
        onRequestsUpdate();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject request',
        subMessage: 'Please try again',
        icon: <AlertCircle className="h-5 w-5" />,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-400'
      });
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [requestId]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 relative"
    >
      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`absolute top-4 right-4 w-80 ${notification.bgColor} ${notification.borderColor} 
                      border rounded-lg p-3 shadow-lg z-50 flex items-start gap-2`}
          >
            <div className={notification.textColor}>
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${notification.textColor} text-sm truncate`}>
                {notification.message}
              </h4>
              <p className={`text-xs ${notification.textColor} opacity-80 truncate`}>
                {notification.subMessage}
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className={`${notification.textColor} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Song Requests</h2>
        <button 
          onClick={fetchRequests}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "rejected"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Request List */}
      {error && (
        <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No {activeTab} requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              formatCurrency={formatCurrency}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              isPending={activeTab === "pending"}
              actionLoadingState={actionLoadingStates[request._id]}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RequestCard({ request, formatCurrency, onAccept, onReject, isPending, actionLoadingState }) {
  if (!request) {
    console.log("Received empty request object");
    return null;
  }
  
  console.log("Rendering request:", request);
  
  // Handle various possible field names and formats
  const {
    _id,
    id,
    songTitle,
    songArtist,
    title,
    artist,
    amount,
    message,
    createdAt,
    albumArt,
    requesterName,
    userName,
    userId,
    status
  } = request;
  
  // Use fallbacks for all fields
  const requestId = _id || id || '';
  const displayTitle = songTitle || title || "Unknown Song";
  const displayArtist = songArtist || artist || "Unknown Artist";
  const displayAmount = amount ? parseFloat(amount) : 0;
  const displayMessage = message || "";
  const displayAlbumArt = albumArt || "https://via.placeholder.com/60?text=No+Image";
  
  // Use the most appropriate name display with fallbacks
  const displayName = requesterName || userName || (userId ? `User ${typeof userId === 'string' ? userId.substring(0, 8) : 'Unknown'}` : "Anonymous");
  
  // Format date and time
  const displayDate = createdAt ? new Date(createdAt) : new Date();
  const formattedTime = displayDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const formattedDate = displayDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Add status banner styles
  const getStatusBanner = () => {
    if (status === 'completed') {
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
        icon: <CheckCircle className="h-4 w-4" />,
        message: 'Request Accepted'
      };
    }
    if (status === 'rejected') {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        icon: <XCircle className="h-4 w-4" />,
        message: 'Request Rejected'
      };
    }
    if (status === 'pending') {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        icon: <Clock className="h-4 w-4" />,
        message: 'Pending Response'
      };
    }
    return null;
  };

  const statusBanner = getStatusBanner();

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
      {/* Status Banner */}
      {statusBanner && (
        <div className={`mb-4 p-2 rounded-lg ${statusBanner.bg} ${statusBanner.border} border flex items-center gap-2`}>
          {statusBanner.icon}
          <span className={`text-sm font-medium ${statusBanner.text}`}>
            {statusBanner.message}
          </span>
          {status === 'completed' && (
            <span className="text-sm text-green-400/60 ml-auto">
              Earnings added to wallet
            </span>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {/* Album Art */}
        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-700">
          {displayAlbumArt ? (
            <img 
              src={displayAlbumArt} 
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/60?text=Error";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <Music className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Request Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-medium text-white">{displayTitle}</h3>
              <p className="text-sm text-gray-400">{displayArtist}</p>
            </div>
            <span className="font-medium text-green-400">
              {formatCurrency(displayAmount)}
            </span>
          </div>
          
          {/* Request metadata */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{displayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}, {formattedTime}</span>
            </div>
          </div>
          
          {/* Message if any */}
          {displayMessage && (
            <p className="mt-2 text-sm text-gray-400 italic">&ldquo;{displayMessage}&rdquo;</p>
          )}
          
          {/* Action Buttons */}
          {isPending && (
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => onAccept(requestId)}
                disabled={!!actionLoadingState}
                className={`px-3 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 
                          rounded-lg text-sm transition-colors flex items-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoadingState === 'accepting' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept'
                )}
              </button>
              <button 
                onClick={() => onReject(requestId)}
                disabled={!!actionLoadingState}
                className={`px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 
                          rounded-lg text-sm transition-colors flex items-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoadingState === 'rejecting' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 