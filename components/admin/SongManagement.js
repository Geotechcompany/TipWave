import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, PlusCircle, RefreshCw, Edit, Trash, Music } from "lucide-react";
import toast from "react-hot-toast";

export default function SongManagement() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchSongs();
  }, [pagination.page, search, filter]);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockSongs = Array.from({ length: 10 }, (_, i) => ({
        id: `song-${i}`,
        title: `Song Title ${i + 1}`,
        artist: `Artist ${i + 1}`,
        requestCount: Math.floor(Math.random() * 100) + 10,
        totalBids: Math.floor(Math.random() * 5000) + 1000,
        status: ["active", "inactive"][i % 2],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));
      setSongs(mockSongs);
      setPagination(prev => ({ ...prev, total: 50 }));
    } catch (error) {
      toast.error("Failed to fetch songs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Songs Management</h1>
        <button
          onClick={() => toast.success("Add song feature coming soon!")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Song
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Songs</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">Song</th>
                <th className="text-left p-4">Artist</th>
                <th className="text-left p-4">Requests</th>
                <th className="text-left p-4">Total Bids</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <Music className="h-5 w-5 text-gray-400 mr-3" />
                        <span>{song.title}</span>
                      </div>
                    </td>
                    <td className="p-4">{song.artist}</td>
                    <td className="p-4">{song.requestCount}</td>
                    <td className="p-4">${song.totalBids.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        song.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {song.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-600 rounded">
                          <Edit className="h-4 w-4 text-blue-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-600 rounded">
                          <Trash className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
} 