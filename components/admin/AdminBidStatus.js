import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export default function AdminBidStatus({ stats, isLoading }) {
  if (isLoading) {
    return <div>Loading bid status...</div>;
  }

  // Ensure stats has the expected structure
  const bidsByStatus = stats?.bidsByStatus || { pending: 0, approved: 0, rejected: 0, completed: 0 };
  const totalBids = Object.values(bidsByStatus).reduce((a, b) => a + b, 0);
  
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Bid Status</h3>
          <DollarSign className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
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