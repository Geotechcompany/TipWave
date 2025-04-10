import { motion } from "framer-motion";
import { Music, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function UserActiveBids({ stats, isLoading }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Active Bids</h3>
        <Link href="/dashboard/bids" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stats.activeBids.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">Song</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            <tbody>
              {stats.activeBids.map((bid, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-700/10 transition-colors duration-150">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{bid.song}</span>
                    </div>
                  </td>
                  <td className="p-4">${bid.amount}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      bid.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                      bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {bid.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-400 text-sm">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <Music className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No active bids</h3>
            <p className="text-gray-400 text-sm mb-4">Start bidding to get your favorite songs played</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200">
              Place Your First Bid
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 