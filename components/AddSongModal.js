import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { X, Music, Clock, User, Disc, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function AddSongModal({ isOpen, onClose, onAddSong }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [songData, setSongData] = useState({
    title: "",
    artist: "",
    album: "",
    duration: "",
    albumArt: "",
    genre: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate duration is a number
    const duration = parseInt(songData.duration, 10);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid duration in seconds");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert duration to seconds if needed
      const formattedData = {
        ...songData,
        duration: duration
      };
      
      await onAddSong(formattedData);
      
      // Reset form
      setSongData({
        title: "",
        artist: "",
        album: "",
        duration: "",
        albumArt: "",
        genre: ""
      });
    } catch (error) {
      console.error("Error adding song:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSongData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Dialog.Title className="text-xl font-bold">
                Add Song to Library
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Music className="w-4 h-4 inline mr-1" />
                  Song Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={songData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Artist
                </label>
                <input
                  type="text"
                  name="artist"
                  required
                  value={songData.artist}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Disc className="w-4 h-4 inline mr-1" />
                  Album
                </label>
                <input
                  type="text"
                  name="album"
                  value={songData.album}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    required
                    min="1"
                    value={songData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 240"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={songData.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Album Art URL
                </label>
                <input
                  type="url"
                  name="albumArt"
                  value={songData.albumArt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/album-art.jpg"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                disabled={isSubmitting}
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
                    Adding...
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4 mr-2" />
                    Add Song
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