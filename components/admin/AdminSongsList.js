import { motion } from "framer-motion";
import Link from "next/link";
import { Music, TrendingUp, Play } from "lucide-react";

export default function AdminSongsList({ songs = [] }) {
  if (!songs || songs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-200">Top Songs</h3>
          <span className="text-xs text-gray-400">No songs found</span>
        </div>
        <div className="p-6 text-center text-gray-400">
          <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No songs to display</p>
        </div>
      </div>
    );
  }

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
        <div className="space-y-4">
          {songs.map((song, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{song.title || 'Untitled'}</p>
                  <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                </div>
                <div className="flex items-center">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    <Play size={14} />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${song.popularity || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{song.plays || 0} plays</span>
                <span className="flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  {song.trend > 0 ? '+' : ''}{song.trend || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 
 