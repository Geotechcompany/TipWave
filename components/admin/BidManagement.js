import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, RefreshCw, Check, X, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

export default function BidManagement() {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchBids();
  }, [pagination.page, search, filter]);

  const fetchBids = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: search,
        filter: filter
      });

      const response = await fetch(`/api/admin/bids?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bids');
      }

      const data = await response.json();
      // Ensure we're getting an array of bids with all required fields
      const formattedBids = data.bids.map(bid => ({
        id: bid._id || bid.id,
        songTitle: bid.song?.title || 'Unknown Song',
        artist: bid.song?.artist || 'Unknown Artist',
        user: bid.user?.name || 'Unknown User',
        amount: bid.amount || 0,
        status: bid.status || 'pending',
        createdAt: bid.createdAt || new Date().toISOString()
      }));
      
      setBids(formattedBids);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error("Failed to fetch bids");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/bids/${bidId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bid status');
      }

      toast.success(`Bid ${newStatus} successfully`);
      setBids(bids.map(bid => 
        bid.id === bidId ? { ...bid, status: newStatus } : bid
      ));
    } catch (error) {
      console.error('Error updating bid status:', error);
      toast.error("Failed to update bid status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center flex-1 bg-gray-800/50 rounded-lg px-3 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bids..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Bids</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left p-4">Song</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/4"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/3"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/4"></div></td>
                  </tr>
                ))
              ) : bids.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400">
                    No bids found
                  </td>
                </tr>
              ) : (
                bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{bid.songTitle}</p>
                        <p className="text-sm text-gray-400">{bid.artist}</p>
                      </div>
                    </td>
                    <td className="p-4">{bid.user}</td>
                    <td className="p-4">${bid.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.status === "pending" ? "bg-blue-500/20 text-blue-400" :
                        bid.status === "completed" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {bid.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(bid.id, "completed")}
                              className="p-1 hover:bg-green-500/20 rounded"
                            >
                              <Check className="h-4 w-4 text-green-400" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(bid.id, "rejected")}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <X className="h-4 w-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
} 