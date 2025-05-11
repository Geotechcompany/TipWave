import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Search, Loader2,
  Music, User,
  ArrowLeft, ArrowRight, 
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

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
  const [defaultCurrency, setDefaultCurrency] = useState({
    code: 'USD',
    symbol: '$',
    rate: 1
  });

  useEffect(() => {
    const fetchDefaultCurrency = async () => {
      try {
        const response = await axios.get('/api/admin/currencies');
        const currencies = response.data.currencies || [];
        
        const defaultCurr = currencies.find(curr => curr.isDefault) || 
                           currencies.find(curr => curr.code === 'USD') ||
                           { code: 'USD', symbol: '$', rate: 1 };
        
        setDefaultCurrency(defaultCurr);
      } catch (error) {
        console.error('Error fetching default currency:', error);
      }
    };
    
    fetchDefaultCurrency();
  }, []);

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
      console.log("Bid data received:", response.data);
      
      if (response.data.bids.length > 0) {
        console.log("Bid data structure sample:", {
          _id: response.data.bids[0]._id,
          songId: response.data.bids[0].songId,
          userId: response.data.bids[0].userId,
          song: response.data.bids[0].song,
          user: response.data.bids[0].user,
          songData: response.data.bids[0].songData,
          userData: response.data.bids[0].userData,
          originalSongId: response.data.bids[0].originalSongId,
          originalUserId: response.data.bids[0].originalUserId,
          songIdForLookup: response.data.bids[0].songIdForLookup,
          userIdForLookup: response.data.bids[0].userIdForLookup
        });
      }
      
      const formattedBids = response.data.bids.map(bid => {
        if (!bid.song?.title && !bid.songData?.title) {
          console.log("Missing song data:", bid);
        }
        if (!bid.user?.name && !bid.userData?.name) {
          console.log("Missing user data:", bid);
        }
        
        return {
          id: bid._id || bid.id,
          songTitle: bid.song?.title || bid.songData?.title || bid.songTitle || 'Unknown Song',
          artist: bid.song?.artist || bid.songData?.artist || bid.artist || 'Unknown Artist',
          albumArt: bid.song?.albumArt || bid.songData?.albumArt || bid.albumArt || null,
          userId: bid.user?._id || bid.userData?._id || bid.userId || null,
          userName: bid.user?.name || bid.userData?.name || bid.userName || 'Unknown User',
          userEmail: bid.user?.email || bid.userData?.email || bid.userEmail || null,
          userImage: bid.user?.image || bid.userData?.image || bid.userImage || null,
          amount: bid.amount || 0,
          status: bid.status || 'pending',
          createdAt: bid.createdAt || new Date().toISOString(),
          notes: bid.notes || ''
        };
      });
      
      setBids(formattedBids);
      setPagination(prev => ({ 
        ...prev, 
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.pages || Math.ceil(response.data.pagination?.total / pagination.limit) || 1
      }));
      
      setSelectedBids([]);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError("Failed to fetch bids. Please try again.");
      toast.error("Failed to fetch bids");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filter, sortBy]);

  const formatCurrency = (amount) => {
    return `${defaultCurrency.symbol}${amount.toLocaleString()}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBids();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBids]);
  
  const refreshBids = async () => {
    setIsRefreshing(true);
    try {
      await fetchBids();
      toast.success("Bid data refreshed");
    } catch (error) {
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
      className="w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Bid Management</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={refreshBids}
            variant="outline"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
          
          {selectedBids.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkAction('approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Selected
              </Button>
              <Button
                onClick={() => handleBulkAction('rejected')}
                variant="destructive"
              >
                Reject Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search bids..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount-high">Highest Amount</option>
            <option value="amount-low">Lowest Amount</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <Music className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-300">No bids found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              checked={selectedBids.length === bids.length && bids.length > 0}
              onChange={toggleAllSelection}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span className="text-sm text-gray-400">
              {selectedBids.length} bid(s) selected
            </span>
          </div>

          <div className="grid gap-4">
            {bids.map((bid) => (
              <div 
                key={bid.id}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedBids.includes(bid.id)}
                    onChange={() => toggleBidSelection(bid.id)}
                    className="rounded border-gray-600 bg-gray-800"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center mr-3 flex-shrink-0">
                        {bid.albumArt ? (
                          <img 
                            src={bid.albumArt} 
                            alt={bid.songTitle} 
                            className="w-full h-full object-cover rounded" 
                          />
                        ) : (
                          <Music className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-white truncate">{bid.songTitle}</h3>
                        <p className="text-sm text-gray-400 truncate">{bid.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-4">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
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
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{bid.userName}</p>
                        <p className="text-xs text-gray-400 truncate">{bid.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                      <div className="text-right flex-1 sm:flex-none">
                        <p className="text-lg font-medium text-white">
                          {formatCurrency(bid.amount)}
                        </p>
                        <Badge 
                          className={`
                            ${bid.status === "pending" ? "bg-blue-500/20 text-blue-400" :
                              bid.status === "approved" ? "bg-green-500/20 text-green-400" :
                              bid.status === "completed" ? "bg-purple-500/20 text-purple-400" :
                              "bg-red-500/20 text-red-400"}
                          `}
                        >
                          {bid.status}
                        </Badge>
                      </div>

                      {bid.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(bid.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(bid.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 flex-col sm:flex-row gap-4">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bids
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
} 