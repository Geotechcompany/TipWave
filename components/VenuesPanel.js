import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Plus, Star, Clock, Users, ExternalLink, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { CreateVenueModal } from "./CreateVenueModal";

export function VenuesPanel() {
  const { data: session } = useSession();
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
  }, [session?.user?.id]);

  const fetchVenues = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/venues`);
      if (!response.ok) throw new Error('Failed to fetch venues');
      const data = await response.json();
      setVenues(data.venues || []);
      setStats(data.stats || {
        totalVenues: 0,
        upcomingEvents: 0,
        favoriteVenues: 0
      });
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (venueId) => {
    try {
      const updatedVenues = venues.map(venue => 
        venue._id === venueId ? {...venue, isFavorite: !venue.isFavorite} : venue
      );
      
      setVenues(updatedVenues);
      
      const favoriteCount = updatedVenues.filter(v => v.isFavorite).length;
      setStats({...stats, favoriteVenues: favoriteCount});
      
      const response = await fetch(`/api/dj/${session.user.id}/venues/${venueId}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isFavorite: updatedVenues.find(v => v._id === venueId)?.isFavorite 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      toast.success('Venue favorite status updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
      
      fetchVenues();
    }
  };

  const filteredVenues = searchQuery
    ? venues.filter(venue => 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : venues;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-4 sm:px-0">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Venues</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-gray-800/40 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-700/30">
            <p className="text-xs text-gray-400">Total Venues</p>
            <p className="text-xl font-bold">{stats.totalVenues}</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-700/30">
            <p className="text-xs text-gray-400">Upcoming Events</p>
            <p className="text-xl font-bold">{stats.upcomingEvents}</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-700/30">
            <p className="text-xs text-gray-400">Favorites</p>
            <p className="text-xl font-bold">{stats.favoriteVenues}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 px-4 sm:px-0">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium sm:whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Venue
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : venues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
          {filteredVenues.map(venue => (
            <VenueCard 
              key={venue._id} 
              venue={venue} 
              onToggleFavorite={toggleFavorite} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <MapPin className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No venues yet</h3>
          <p className="text-gray-400 mb-6">Add your first venue to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </button>
        </div>
      )}

      <CreateVenueModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onVenueCreated={fetchVenues}
      />
    </motion.div>
  );
}

function VenueCard({ venue, onToggleFavorite }) {
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