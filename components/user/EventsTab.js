import { motion } from "framer-motion";
import { Calendar, PartyPopper } from "lucide-react";
import Image from "next/image";
import { DEFAULT_ALBUM_ART } from '@/utils/constants';

export function EventsTab({ events = [] }) {
  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    return end 
      ? `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
      : start.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6"
    >
      <h2 className="text-xl font-bold mb-6">Upcoming Events</h2>
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event._id || index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-700/30 transition-colors duration-200">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized={event.coverImage.startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-blue-300">
                  {formatEventDate(event.startDate, event.endDate)}
                </p>
                <p className="text-xs text-gray-400">{event.venue}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <PartyPopper className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Upcoming Events</h3>
          <p className="text-gray-500 max-w-sm">
            Stay tuned! Events will be displayed here as they become available.
          </p>
          <button className="mt-6 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors duration-200">
            Browse Events
          </button>
        </motion.div>
      )}
    </motion.div>
  );
} 