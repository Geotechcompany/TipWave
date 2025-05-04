import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { motion } from "framer-motion";
import { X, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

export function CreateVenueModal({ isOpen, onClose, onVenueCreated }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueData, setVenueData] = useState({
    name: "",
    address: "",
    capacity: "",
    website: "",
    description: "",
    contactEmail: "",
    contactPhone: ""
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
      const response = await fetch(`/api/dj/${session?.user?.id}/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venueData),
      });

      if (!response.ok) {
        throw new Error('Failed to create venue');
      }

      toast.success('Venue created successfully!');
      onClose();
      if (onVenueCreated) onVenueCreated();
      
      setVenueData({
        name: "",
        address: "",
        capacity: "",
        website: "",
        description: "",
        contactEmail: "",
        contactPhone: ""
      });
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Failed to create venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVenueData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gray-900 rounded-xl w-full max-w-lg mx-auto shadow-xl overflow-hidden z-10"
        >
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <h2 className="text-lg font-medium">Add New Venue</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[80vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Venue Name</label>
                  <input
                    required
                    type="text"
                    value={venueData.name}
                    onChange={handleInputChange}
                    name="name"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    required
                    type="text"
                    value={venueData.address}
                    onChange={handleInputChange}
                    name="address"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input
                    required
                    type="number"
                    value={venueData.capacity}
                    onChange={handleInputChange}
                    name="capacity"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue capacity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={venueData.website}
                    onChange={handleInputChange}
                    name="website"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue website"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={venueData.description}
                    onChange={handleInputChange}
                    name="description"
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={venueData.contactEmail}
                    onChange={handleInputChange}
                    name="contactEmail"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue contact email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={venueData.contactPhone}
                    onChange={handleInputChange}
                    name="contactPhone"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Enter venue contact phone"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium flex items-center justify-center disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Venue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 