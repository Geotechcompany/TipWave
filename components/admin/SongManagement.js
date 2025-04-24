import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Music, Search, Plus, Edit, Trash2, X, 
  ArrowLeft, ArrowRight, Save, Upload, Loader
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

export default function SongManagement() {
  // State for songs data and UI
  const [songs, setSongs] = useState([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Search/Filter
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Song form for add/edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [currentSong, setCurrentSong] = useState({
    title: "",
    artist: "",
    genre: "",
    duration: "",
    releaseYear: new Date().getFullYear(),
    albumArt: "",
    isExplicit: false,
    popularity: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  // Wrap fetchSongs in useCallback to memoize it
  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/admin/songs", {
        params: {
          page,
          limit: pageSize,
          search: debouncedSearchTerm,
          category: filterCategory !== "all" ? filterCategory : undefined
        }
      });
      
      setSongs(response.data.songs);
      setTotalSongs(response.data.total);
    } catch (error) {
      console.error("Error fetching songs:", error);
      setError("Failed to load songs");
      toast.error("Failed to load songs");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, filterCategory]);
  
  // Fetch songs when page, pageSize, search term or filter changes
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);
  
  // Total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(totalSongs / pageSize);
  }, [totalSongs, pageSize]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setCurrentSong({
        ...currentSong,
        [name]: checked
      });
    } else if (name === "releaseYear") {
      // Ensure year is a number and within reasonable bounds
      const year = parseInt(value);
      if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
        setCurrentSong({
          ...currentSong,
          [name]: year
        });
      }
    } else if (name === "popularity") {
      // Ensure popularity is a number between 0-100
      const popularity = parseInt(value);
      if (!isNaN(popularity) && popularity >= 0 && popularity <= 100) {
        setCurrentSong({
          ...currentSong,
          [name]: popularity
        });
      }
    } else {
      setCurrentSong({
        ...currentSong,
        [name]: value
      });
    }
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Open form for adding a new song
  const openAddForm = () => {
    setCurrentSong({
      title: "",
      artist: "",
      genre: "",
      duration: "",
      releaseYear: new Date().getFullYear(),
      albumArt: "",
      isExplicit: false,
      popularity: 50
    });
    setImagePreview("");
    setImageFile(null);
    setFormMode("add");
    setIsFormOpen(true);
  };
  
  // Open form for editing an existing song
  const openEditForm = (song) => {
    setCurrentSong({
      id: song._id,
      title: song.title || "",
      artist: song.artist || "",
      genre: song.genre || "",
      duration: song.duration || "",
      releaseYear: song.releaseYear || new Date().getFullYear(),
      albumArt: song.albumArt || "",
      isExplicit: song.isExplicit || false,
      popularity: song.popularity || 50
    });
    setImagePreview(song.albumArt || "");
    setImageFile(null);
    setFormMode("edit");
    setIsFormOpen(true);
  };
  
  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add song data
      Object.keys(currentSong).forEach(key => {
        if (key !== 'albumArt') { // Don't add albumArt URL to form data
          formData.append(key, currentSong[key]);
        }
      });
      
      // Add image file if any
      if (imageFile) {
        formData.append('albumArt', imageFile);
      }
      
      if (formMode === "add") {
        await axios.post("/api/admin/songs", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Song added successfully");
      } else {
        await axios.put(`/api/admin/songs/${currentSong.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Song updated successfully");
      }
      
      // Close form and refresh songs
      closeForm();
      fetchSongs();
    } catch (error) {
      console.error("Error saving song:", error);
      toast.error("Failed to save song");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle song deletion
  const handleDeleteSong = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/songs/${songId}`);
      toast.success("Song deleted successfully");
      
      // Refresh the song list
      fetchSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
      toast.error(error.response?.data?.error || "Failed to delete song");
    }
  };
  
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // eslint-disable-next-line no-unused-vars
  const parseDuration = (durationString) => {
    const parts = durationString.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0]);
      const secs = parseInt(parts[1]);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    return 0;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Music className="mr-2 h-6 w-6" />
          Song Management
        </h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genres</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="rnb">R&B</option>
            <option value="country">Country</option>
            <option value="electronic">Electronic</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="other">Other</option>
          </select>
          
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Song
          </button>
        </div>
      </div>
      
      {/* Songs Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-20 text-red-400">
            <div>
              <div className="flex justify-center mb-4">
                <X className="h-16 w-16" />
              </div>
              <p className="text-center">{error}</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={fetchSongs}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex justify-center items-center p-20 text-gray-400">
            <div>
              <div className="flex justify-center mb-4">
                <Music className="h-16 w-16" />
              </div>
              <p className="text-center">No songs found</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={openAddForm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center text-white"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Song
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Song
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Year
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {songs.map((song) => (
                    <tr key={song._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {song.albumArt ? (
                              <img 
                                src={song.albumArt} 
                                alt={song.title}
                                className="h-10 w-10 rounded-md object-cover" 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-700 flex items-center justify-center">
                                <Music className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{song.title}</div>
                            {song.isExplicit && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-800 text-red-100">
                                Explicit
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {song.artist}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        {song.genre || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                        {formatDuration(song.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                        {song.releaseYear || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => openEditForm(song)}
                          className="text-blue-400 hover:text-blue-300 mx-2"
                          title="Edit Song"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song._id)}
                          className="text-red-400 hover:text-red-300 mx-2"
                          title="Delete Song"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-800">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                    page === 1 
                      ? "text-gray-500 bg-gray-900 cursor-not-allowed" 
                      : "text-white bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                    page === totalPages 
                      ? "text-gray-500 bg-gray-900 cursor-not-allowed" 
                      : "text-white bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalSongs)}</span> to{" "}
                    <span className="font-medium">{Math.min(page * pageSize, totalSongs)}</span> of{" "}
                    <span className="font-medium">{totalSongs}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 text-sm font-medium ${
                        page === 1 
                          ? "text-gray-500 bg-gray-900 cursor-not-allowed" 
                          : "text-white bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page number buttons */}
                    {Array.from({ length: Math.min(totalPages || 0, 100) }).map((_, i) => {
                      const pageNum = i + 1;
                      // Show limited page numbers with ellipsis
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? "z-10 bg-blue-600 border-blue-500 text-white"
                                : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        (pageNum === page - 2 && pageNum > 1) ||
                        (pageNum === page + 2 && pageNum < totalPages)
                      ) {
                        return (
                          <span
                            key={pageNum}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 text-sm font-medium ${
                        page === totalPages 
                          ? "text-gray-500 bg-gray-900 cursor-not-allowed" 
                          : "text-white bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Song Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-700 p-6">
              <h2 className="text-xl font-bold">
                {formMode === "add" ? "Add New Song" : "Edit Song"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Album Art Upload */}
                <div className="md:col-span-2">
                  <div className="flex justify-center">
                    <div className="relative h-48 w-48 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Album art preview" 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <Music className="h-16 w-16 text-gray-500" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center transition-opacity group">
                        <label className="cursor-pointer p-3 rounded-full bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="h-6 w-6" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    Click to upload album art
                  </p>
                </div>
                
                {/* Song Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={currentSong.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Artist */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Artist <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={currentSong.artist}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Genre
                  </label>
                  <select
                    name="genre"
                    value={currentSong.genre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Genre</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="hip-hop">Hip Hop</option>
                    <option value="rnb">R&B</option>
                    <option value="country">Country</option>
                    <option value="electronic">Electronic</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (MM:SS)
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={currentSong.duration}
                    onChange={handleInputChange}
                    placeholder="3:45"
                    pattern="^\d+:\d{2}$"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: minutes:seconds (e.g. 3:45)</p>
                </div>
                
                {/* Release Year */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={currentSong.releaseYear}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Popularity */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Popularity (0-100)
                  </label>
                  <input
                    type="number"
                    name="popularity"
                    value={currentSong.popularity}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Explicit Flag */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="explicit-checkbox"
                    name="isExplicit"
                    checked={currentSong.isExplicit}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="explicit-checkbox" className="ml-2 block text-sm">
                    Explicit Content
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      {formMode === "add" ? "Add Song" : "Update Song"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 