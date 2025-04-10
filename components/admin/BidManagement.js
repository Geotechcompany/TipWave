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
      // Mock data - replace with actual API call
      const mockBids = Array.from({ length: 10 }, (_, i) => ({
        id: `bid-${i}`,
        songTitle: `Song Title ${i + 1}`,
        artist: `Artist ${i + 1}`,
        amount: Math.floor(Math.random() * 100) + 10,
        user: `User ${i + 1}`,
        status: ["pending", "completed", "rejected"][i % 3],
        createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString()
      }));
      setBids(mockBids);
      setPagination(prev => ({ ...prev, total: 50 }));
    } catch (error) {
      toast.error("Failed to fetch bids");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      // Mock API call
      toast.success(`Bid ${newStatus} successfully`);
      setBids(bids.map(bid => 
        bid.id === bidId ? { ...bid, status: newStatus } : bid
      ));
    } catch (error) {
      toast.error("Failed to update bid status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bids Management</h1>
        <button
          onClick={fetchBids}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search bids..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <thead>
              <tr className="border-b border-gray-700">
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
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div>{bid.songTitle}</div>
                          <div className="text-sm text-gray-400">{bid.artist}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{bid.user}</td>
                    <td className="p-4">${bid.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.status === "completed" ? "bg-green-500/20 text-green-400" :
                        bid.status === "pending" ? "bg-blue-500/20 text-blue-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
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