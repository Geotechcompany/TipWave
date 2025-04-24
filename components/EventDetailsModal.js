import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, MapPin, Users } from "lucide-react";

export function EventDetailsModal({ isOpen, onClose, event }) {
  if (!event) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/80" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gray-900 rounded-xl max-w-2xl w-full shadow-xl"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Dialog.Title className="text-xl font-bold text-white">
                Event Details
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {event.image && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-white mb-4">{event.name}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="h-4 w-4 mr-2" />
                    {event.capacity} capacity
                  </div>
                </div>
              </div>

              {event.description && (
                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-gray-300 text-sm">{event.description}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {/* Implement edit functionality */}}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium"
              >
                Edit Event
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
} 