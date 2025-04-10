import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminBidStatus({ stats, isLoading }) {
  const statuses = [
    { label: "Pending", value: stats.bidsByStatus.pending, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Completed", value: stats.bidsByStatus.completed, color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { label: "Rejected", value: stats.bidsByStatus.rejected, color: "bg-red-500/20 text-red-400 border-red-500/30" }
  ];

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.9 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Bid Status</h3>
        <Link href="/admin/bids" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {statuses.map((status, i) => (
              <div key={i} className={`p-4 rounded-lg border ${status.color}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{status.label}</span>
                  <span className="text-xl font-bold">{status.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 