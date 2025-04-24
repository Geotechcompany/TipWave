import { motion } from "framer-motion";
import { Headphones, Users, Calendar, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function LiveDJs({ stats, isLoading }) {
  const [filterGenre, setFilterGenre] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Live DJs
          </h1>
          <p className="text-gray-400">Currently playing at venues near you</p>
        </div>
        
        {/* Genre Filter */}
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Genres</option>
          <option value="house">House</option>
          <option value="hiphop">Hip Hop</option>
          <option value="electronic">Electronic</option>
          <option value="pop">Pop</option>
        </select>
      </div>

      {/* Live DJs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          stats.liveDJs?.map((dj, index) => (
            <motion.div
              key={dj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              {/* DJ Header */}
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={dj.avatar || "/default-avatar.png"}
                    alt={dj.name}
                    fill
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div>
                  <h3 className="font-medium flex items-center">
                    {dj.name}
                    {dj.isVerified && (
                      <Star className="h-4 w-4 text-yellow-400 ml-1 inline" fill="currentColor" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-400">{dj.genre}</p>
                </div>
              </div>

              {/* Venue Info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                  <span>{dj.venue}</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span>{dj.currentListeners} listening</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-green-400" />
                  <span>{dj.eventTime}</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 bg-purple-600/80 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <Headphones className="h-4 w-4 mr-2" />
                <span>Request a Song</span>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && (!stats.liveDJs || stats.liveDJs.length === 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Headphones className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No DJs Live Right Now</h3>
          <p className="text-gray-400 text-sm">Check back later for live events</p>
        </motion.div>
      )}
    </div>
  );
} 