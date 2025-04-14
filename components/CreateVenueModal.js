import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { X, MapPin, Users, Globe, Loader2, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export function CreateVenueModal({ isOpen, onClose, onVenueCreated }) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueData, setVenueData] = useState({
    name: "",
    address: "",
    capacity: "",
    website: "",
    description: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/venues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...venueData,
          djId: user?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create venue');
      
      toast.success('Venue created successfully!');
      onVenueCreated();
      onClose();
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Failed to create venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Dialog.Title className="text-xl font-bold">
                Add New Venue
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  required
                  value={venueData.name}
                  onChange={(e) => setVenueData({ ...venueData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={venueData.address}
                  onChange={(e) => setVenueData({ ...venueData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  value={venueData.capacity}
                  onChange={(e) => setVenueData({ ...venueData, capacity: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={venueData.website}
                  onChange={(e) => setVenueData({ ...venueData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={venueData.description}
                  onChange={(e) => setVenueData({ ...venueData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
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
                    <Plus className="h-4 w-4 mr-2" />
                    Create Venue
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 