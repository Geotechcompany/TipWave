import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminUsersList({ stats, isLoading }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Recent Users</h3>
        <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
      </div>
      <div className="px-6 divide-y divide-gray-700">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="py-4 flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : (
          stats.recentUsers.map((user, i) => (
            <div key={i} className="py-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm">{user.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                user.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
              }`}>
                {user.status}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
} 