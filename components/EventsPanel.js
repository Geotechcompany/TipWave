import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Users, ChevronRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { CreateEventModal } from "./CreateEventModal";
import { EventDetailsModal } from "./EventDetailsModal";

export function EventsPanel() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('upcoming'); // upcoming, past, all
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [session?.user?.id, view]);

  const fetchEvents = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/events?view=${view}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Events</h2>
          <div className="flex items-center space-x-2">
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All Events</option>
            </select>
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium"
            >
              Create Event
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-400">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard 
                key={event.id || index}
                event={event} 
                onViewDetails={() => handleViewDetails(event)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </>
  );
}

function EventCard({ event, onViewDetails }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{event.name}</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {new Date(event.date).toLocaleTimeString()}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {event.venue}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {event.capacity} capacity
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            event.status === 'upcoming' ? 'bg-green-500/20 text-green-400' :
            event.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
          <button 
            onClick={onViewDetails}
            className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
} 