import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function AdminBidStatus({ initialStats = null }) {
  // State management
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(!initialStats);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on component mount if not provided
  useEffect(() => {
    if (!initialStats) {
      fetchBidStats();
    }
  }, [initialStats]);

  const fetchBidStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/stats/bids');
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching bid status:", err);
      setError("Failed to load bid statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('/api/admin/stats/bids');
      setStats(response.data);
    } catch (err) {
      console.error("Error refreshing bid status:", err);
      setError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // Ensure stats has the expected structure
  const bidsByStatus = stats?.bidsByStatus || { pending: 0, approved: 0, rejected: 0, completed: 0 };
  const totalBids = Object.values(bidsByStatus).reduce((a, b) => a + b, 0);
  
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Bid Status</h3>
        <motion.button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="text-gray-400 hover:text-blue-400 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center p-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 text-center text-red-400"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <div className="space-y-5">
              <StatusBar 
                label="Pending" 
                count={bidsByStatus.pending}
                total={totalBids}
                color="bg-blue-500"
              />
              <StatusBar 
                label="Approved" 
                count={bidsByStatus.approved}
                total={totalBids}
                color="bg-green-500"
              />
              <StatusBar 
                label="Rejected" 
                count={bidsByStatus.rejected}
                total={totalBids}
                color="bg-red-500"
              />
              <StatusBar 
                label="Completed" 
                count={bidsByStatus.completed}
                total={totalBids}
                color="bg-purple-500"
              />
            </div>
            
            {totalBids > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-700">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Total Bids</span>
                  <span className="font-medium text-gray-300">{totalBids}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <motion.div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-2 ${color}`}
          style={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
} 