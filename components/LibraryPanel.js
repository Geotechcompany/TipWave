import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Music, Search, Plus, Trash2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { AddSongModal } from "./AddSongModal";

export function LibraryPanel() {
  const { data: session } = useSession();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/library`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load music library');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSongs();
    }
  }, [fetchSongs, session?.user?.id]);

  const handleAddSong = async (songData) => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });
      
      if (!response.ok) throw new Error('Failed to add song');
      
      toast.success('Song added to library!');
      fetchSongs(); // Refresh the song list
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song');
    }
  };

  const handleDeleteSong = async (songId) => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/library/${songId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete song');
      
      toast.success('Song removed from library');
      fetchSongs(); // Refresh the song list
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
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
      className="bg-gray-900 rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Music Library</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Song
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search songs or artists..."
          className="pl-10 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <SongCard
              key={song._id}
              {...song}
              onDelete={() => handleDeleteSong(song._id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No songs match your search' : 'Your library is empty'}
          </div>
        )}
      </div>

      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSong={handleAddSong}
      />
    </motion.div>
  );
}

function SongCard({  title, artist, album, duration, albumArt, onDelete }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
          {albumArt ? (
            <img src={albumArt} alt={album} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Music className="h-6 w-6 text-blue-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{artist}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {formatDuration(duration)}
          </span>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 