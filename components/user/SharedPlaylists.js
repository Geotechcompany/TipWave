import { motion } from "framer-motion";
import { Share2, Music, Users, Play, Plus, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function SharedPlaylists({ stats, isLoading }) {
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Shared Playlists
          </h1>
          <p className="text-gray-400">Discover and share song collections</p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Playlists</option>
            <option value="popular">Popular</option>
            <option value="recent">Recently Added</option>
            <option value="my">My Playlists</option>
          </select>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Playlist
          </button>
        </div>
      </div>

      {/* Playlists Grid */}
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
              <div className="w-full h-40 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </motion.div>
          ))
        ) : (
          stats.sharedPlaylists?.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
            >
              {/* Playlist Cover */}
              <div className="relative w-full h-40">
                <Image
                  src={playlist.coverImage || "/default-playlist-cover.png"}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button className="p-3 bg-indigo-600 rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-200">
                    <Play className="h-6 w-6" fill="currentColor" />
                  </button>
                </div>
              </div>

              {/* Playlist Info */}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{playlist.name}</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Created by {playlist.creator}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <Music className="h-4 w-4 mr-1" />
                    <span>{playlist.songCount} songs</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{playlist.followers} followers</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{playlist.likes}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && (!stats.sharedPlaylists || stats.sharedPlaylists.length === 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Share2 className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Shared Playlists</h3>
          <p className="text-gray-400 text-sm mb-4">Create or follow playlists to see them here</p>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors duration-200">
            Create Your First Playlist
          </button>
        </motion.div>
      )}
    </div>
  );
} 