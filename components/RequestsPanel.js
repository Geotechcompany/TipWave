import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, DollarSign, Clock, User, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function RequestsPanel() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    if (session?.user?.id) {
      fetchRequests();
    }
  }, [session?.user?.id, activeTab]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/requests?status=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/requests/${requestId}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept request');
      }
      
      toast.success('Request accepted successfully!');
      // Refresh the requests list
      const updatedResponse = await fetch(`/api/dj/${session.user.id}/requests?status=${activeTab}`);
      const updatedData = await updatedResponse.json();
      setRequests(updatedData.requests || []);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6"
    >
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
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard
              key={request._id}
              {...request}
              onAccept={() => handleAcceptRequest(request._id)}
              isPending={activeTab === "pending"}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No {activeTab} requests found
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RequestCard({ title, artist, amount, requesterName, createdAt, onAccept, isPending }) {
  const formattedTime = new Date(createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
          <Music className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{artist}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {requesterName}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formattedTime}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-green-500 flex items-center">
            <DollarSign className="h-4 w-4" />
            {amount}
          </p>
          {isPending && (
            <button 
              onClick={onAccept}
              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 