import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, RefreshCw, Check, X, DollarSign, 
  ChevronLeft, ChevronRight, Loader2,
  AlertCircle, MoreHorizontal, Music, User
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export default function BidManagement() {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedBids, setSelectedBids] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Memoize fetchBids function with useCallback
  const fetchBids = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
        filter: filter,
        sort: sortBy
      });

      const response = await axios.get(`/api/admin/bids?${queryParams}`);
      
      // Format the bids from the response
      const formattedBids = response.data.bids.map(bid => ({
        id: bid._id || bid.id,
        songTitle: bid.song?.title || 'Unknown Song',
        artist: bid.song?.artist || 'Unknown Artist',
        albumArt: bid.song?.albumArt || null,
        userId: bid.user?._id || bid.user?.id || null,
        userName: bid.user?.name || 'Unknown User',
        userEmail: bid.user?.email || null,
        userImage: bid.user?.image || null,
        amount: bid.amount || 0,
        status: bid.status || 'pending',
        createdAt: bid.createdAt || new Date().toISOString(),
        notes: bid.notes || ''
      }));
      
      setBids(formattedBids);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.pages || Math.ceil(response.data.pagination?.total / pagination.limit) || 1
      }));
      
      // Clear selection when fetching new bids
      setSelectedBids([]);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError("Failed to fetch bids. Please try again.");
      toast.error("Failed to fetch bids");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filter, sortBy]);

  // Add debouncing for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBids();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBids]);
  
  // Now the refreshBids function should use the memoized fetchBids
  const refreshBids = async () => {
    setIsRefreshing(true);
    try {
      await fetchBids();
      toast.success("Bid data refreshed");
    } catch (error) {
      // Error is already handled in fetchBids
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      await axios.patch(`/api/admin/bids/${bidId}/status`, {
        status: newStatus
      });

      setBids(bids.map(bid => 
        bid.id === bidId ? { ...bid, status: newStatus } : bid
      ));
      
      toast.success(`Bid ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating bid status:', error);
      toast.error("Failed to update bid status");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedBids.length === 0) {
      toast.error("No bids selected");
      return;
    }

    try {
      await axios.post(`/api/admin/bids/bulk`, {
        bidIds: selectedBids,
        action
      });

      // Update local state
      const updatedBids = bids.map(bid => 
        selectedBids.includes(bid.id) 
          ? { ...bid, status: action } 
          : bid
      );
      
      setBids(updatedBids);
      setSelectedBids([]);
      toast.success(`${selectedBids.length} bids updated successfully`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error("Failed to update bids");
    }
  };

  const toggleBidSelection = (bidId) => {
    setSelectedBids(prev => 
      prev.includes(bidId)
        ? prev.filter(id => id !== bidId)
        : [...prev, bidId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedBids(prev => 
      prev.length === bids.length 
        ? [] 
        : bids.map(bid => bid.id)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center flex-1 bg-gray-800/50 rounded-lg px-3 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search songs, artists or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bids</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
          
          <motion.button
            onClick={refreshBids}
            disabled={isLoading || isRefreshing}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedBids.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-gray-800/70 rounded-lg p-3"
        >
          <span className="text-sm text-gray-300">
            {selectedBids.length} bid{selectedBids.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkAction('approved')}
              className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-md text-xs flex items-center"
            >
              <Check className="w-3 h-3 mr-1" /> Approve All
            </button>
            <button 
              onClick={() => handleBulkAction('rejected')}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md text-xs flex items-center"
            >
              <X className="w-3 h-3 mr-1" /> Reject All
            </button>
            <button 
              onClick={() => handleBulkAction('completed')}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-md text-xs flex items-center"
            >
              <DollarSign className="w-3 h-3 mr-1" /> Mark Completed
            </button>
            <button 
              onClick={() => setSelectedBids([])}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md text-xs"
            >
              Clear Selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Bids table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-200">Song Requests</h3>
          <span className="text-sm text-gray-400">
            {pagination.total} total bids
          </span>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12"
            >
              <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />
              <p className="text-gray-400">Loading bids...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
              <p className="text-red-400 mb-2">{error}</p>
              <button 
                onClick={refreshBids}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm mt-2"
              >
                Try Again
              </button>
            </motion.div>
          ) : bids.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <Music className="w-10 h-10 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">No bids found</p>
              <p className="text-gray-500 text-sm mb-4">
                {search ? "Try a different search term or filter." : "There are no song requests yet."}
              </p>
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="p-4 text-left">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selectedBids.length === bids.length && bids.length > 0}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-opacity-25"
                        />
                      </div>
                    </th>
                    <th className="p-4 text-left">Song</th>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-700/30">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedBids.includes(bid.id)}
                          onChange={() => toggleBidSelection(bid.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-opacity-25"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mr-3">
                            {bid.albumArt ? (
                              <img 
                                src={bid.albumArt} 
                                alt={bid.songTitle} 
                                className="w-full h-full object-cover rounded" 
                              />
                            ) : (
                              <Music className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{bid.songTitle}</p>
                            <p className="text-sm text-gray-400">{bid.artist}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                            {bid.userImage ? (
                              <img 
                                src={bid.userImage} 
                                alt={bid.userName} 
                                className="w-full h-full object-cover rounded-full" 
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p>{bid.userName}</p>
                            {bid.userEmail && (
                              <p className="text-xs text-gray-400">{bid.userEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        ${bid.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          bid.status === "pending" ? "bg-blue-500/20 text-blue-400" :
                          bid.status === "approved" ? "bg-green-500/20 text-green-400" :
                          bid.status === "completed" ? "bg-purple-500/20 text-purple-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {bid.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {bid.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(bid.id, "approved")}
                                className="p-1.5 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(bid.id, "rejected")}
                                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {bid.status === "approved" && (
                            <button
                              onClick={() => handleStatusChange(bid.id, "completed")}
                              className="p-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                              title="Mark Completed"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <Link 
                            href={`/admin/bids/${bid.id}`}
                            className="p-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                            title="View Details"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && !isLoading && !error && bids.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bids
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 