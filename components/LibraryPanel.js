import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Search, Plus, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export function LibraryPanel() {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", artist: "", genre: "" });

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dj/${user.id}/library`);
        if (!response.ok) {
          throw new Error('Failed to fetch library');
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching library:', error);
        toast.error('Failed to load library');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, [user?.id]);

  const handleAddSong = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dj/library/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSong, djId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to add song');
      
      const data = await response.json();
      setSongs([...songs, data]);
      setIsAddingSong(false);
      setNewSong({ title: "", artist: "", genre: "" });
      toast.success('Song added successfully!');
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song');
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Library</h2>
        <button
          onClick={() => setIsAddingSong(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Song
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Songs List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song._id} {...song} />
          ))}
        </div>
      )}

      {/* Add Song Modal */}
      {isAddingSong && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md"
          >
            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist</label>
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={newSong.genre}
                  onChange={(e) => setNewSong({ ...newSong, genre: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingSong(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Add Song
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

function SongCard({ title, artist, genre }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
          <Music className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{artist}</p>
          <span className="text-xs text-gray-500">{genre}</span>
        </div>
      </div>
    </div>
  );
} 