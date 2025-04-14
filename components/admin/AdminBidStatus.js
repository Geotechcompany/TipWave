import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export default function AdminBidStatus({ stats, isLoading }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6 border-b border-gray-700">
        <h3 className="font-semibold">Bid Status</h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <StatusBar 
              label="Pending" 
              count={stats.bidsByStatus.pending}
              total={Object.values(stats.bidsByStatus).reduce((a, b) => a + b, 0)}
              color="bg-blue-500"
            />
            <StatusBar 
              label="Completed" 
              count={stats.bidsByStatus.completed}
              total={Object.values(stats.bidsByStatus).reduce((a, b) => a + b, 0)}
              color="bg-green-500"
            />
            <StatusBar 
              label="Rejected" 
              count={stats.bidsByStatus.rejected}
              total={Object.values(stats.bidsByStatus).reduce((a, b) => a + b, 0)}
              color="bg-red-500"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 