import { motion } from "framer-motion";
import { Music, TrendingUp, Fire, Clock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DEFAULT_ALBUM_ART } from '@/utils/constants';

export function TrendingSongs({ stats, isLoading }) {
  const [timeRange, setTimeRange] = useState("day");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Trending Songs
          </h1>
          <p className="text-gray-400">Most requested songs right now</p>
        </div>
        
        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Trending Songs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Actual song cards
          stats.trendingSongs?.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-200"
            >
              <div className="flex gap-4">
                {/* Album Art */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={song.albumArt || DEFAULT_ALBUM_ART}
                    alt={song.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1">
                  <h3 className="font-medium truncate">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center text-blue-400">
                      <Fire className="h-4 w-4 mr-1" />
                      <span>{song.requestCount} requests</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>${song.averageBid}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last request {song.lastRequestTime} ago</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && (!stats.trendingSongs || stats.trendingSongs.length === 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Music className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No trending songs</h3>
          <p className="text-gray-400 text-sm">Check back later for the hottest tracks</p>
        </motion.div>
      )}
    </div>
  );
} 