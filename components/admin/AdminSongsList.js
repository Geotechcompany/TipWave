import { motion } from "framer-motion";
import Link from "next/link";
import { Music } from "lucide-react";

export default function AdminSongsList({ stats, isLoading }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Top Songs</h3>
        <Link href="/admin/songs" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
      </div>
      <div className="px-6 divide-y divide-gray-700">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="py-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          stats.topSongs.map((song, i) => (
            <div key={i} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
                <div className="text-sm text-blue-400">${song.totalBids.toLocaleString()}</div>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Music className="h-3 w-3 mr-1" />
                {song.requestCount} requests
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
} 