import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Plus, Star, Clock, Users, ExternalLink, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { CreateVenueModal } from "./CreateVenueModal";

export function VenuesPanel() {
  const { user } = useUser();
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalVenues: 0,
    upcomingEvents: 0,
    favoriteVenues: 0
  });

  useEffect(() => {
    fetchVenues();
  }, [user?.id]);

  const fetchVenues = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${user.id}/venues`);
      if (!response.ok) throw new Error('Failed to fetch venues');
      const data = await response.json();
      setVenues(data.venues);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Venues</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Venue
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Venues</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalVenues}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Upcoming Events</p>
              <h3 className="text-2xl font-bold mt-1">{stats.upcomingEvents}</h3>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Favorite Venues</p>
              <h3 className="text-2xl font-bold mt-1">{stats.favoriteVenues}</h3>
            </div>
            <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-700/50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : venues.length > 0 ? (
            venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Venues Found</h3>
              <p className="text-gray-400 text-sm">Add your first venue to get started</p>
            </div>
          )}
        </div>
      </div>

      <CreateVenueModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onVenueCreated={fetchVenues}
      />
    </motion.div>
  );
}

function VenueCard({ venue }) {
  return (
    <div className="p-6 hover:bg-gray-700/20 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-lg">{venue.name}</h3>
            {venue.isFavorite && (
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{venue.address}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-300">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              <span>Capacity: {venue.capacity}</span>
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Clock className="h-4 w-4 mr-2 text-purple-400" />
              <span>{venue.upcomingEvents} upcoming</span>
            </div>
          </div>
        </div>
        
        <a
          href={venue.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
} 