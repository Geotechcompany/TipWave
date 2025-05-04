"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Calendar, Clock, MapPin, Music, Users, X, Loader2 } from "lucide-react";

export function CreateEventModal({ isOpen, onClose }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    genre: "",
    capacity: "",
    imageUrl: ""
  });

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          userId: session?.user?.id,
          createdBy: session?.user?.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      toast.success('Event created successfully!');
      onClose();
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        genre: "",
        capacity: "",
        imageUrl: ""
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-10 relative"
        >
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h2 className="text-lg font-medium">Create New Event</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  value={eventData.title}
                  onChange={handleInputChange}
                  name="title"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2.5"
                  placeholder="Event name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2.5 min-h-[100px]"
                  placeholder="Event description"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-gray-700 border-gray-600 text-white px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-gray-700 border-gray-600 text-white px-4 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg bg-gray-700 border-gray-600 text-white px-4 py-2.5"
                  placeholder="Event location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Music className="w-4 h-4 inline mr-1" />
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={eventData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-gray-700 border-gray-600 text-white px-4 py-2.5"
                    placeholder="Music genre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={eventData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full rounded-lg bg-gray-700 border-gray-600 text-white px-4 py-2.5"
                    placeholder="Max attendees"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 