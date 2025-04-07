import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, Share2, ChevronRight, 
  Bell, Settings, Calendar, BarChart2,
  ChevronDown, Search, Maximize, Users,
  PlusCircle, Headphones, ListMusic
} from "lucide-react";
import toast from "react-hot-toast";

export default function DJDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    earnings: 0,
    upcomingEvents: [],
    topSongs: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  
  // Mock notifications - in a real app these would come from an API
  const notifications = [
    { id: 1, type: 'success', message: 'New song request: "Dancing Queen" - $20 bid', time: '2m ago' },
    { id: 2, type: 'info', message: 'Venue "Pulse Nightclub" has booked you', time: '1h ago' },
    { id: 3, type: 'alert', message: 'Your profile is getting 45% more views this week', time: '5h ago' }
  ];

  useEffect(() => {
    fetchDJStats();
  }, []);

  const fetchDJStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dj/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch DJ stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching DJ stats:", error);
      toast.error("Failed to load your dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePanelToggle = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center space-x-4">
            <div className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              TipWave
            </div>
            <span className="px-2 py-1 rounded-md bg-blue-900/30 text-blue-400 text-xs font-medium">
              DJ Portal
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-800 relative"
              >
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50 border border-gray-700">
                  <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1.5 rounded-full ${
                            notification.type === 'success' ? 'bg-green-500/20 text-green-500' :
                            notification.type === 'alert' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {notification.type === 'success' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : notification.type === 'alert' ? (
                              <Bell className="h-4 w-4" />
                            ) : (
                              <Info className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-700 text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300 w-full py-1">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-800">
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                <div className="bg-gray-800 w-full h-full rounded-full flex items-center justify-center">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "DJ"}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.firstName?.[0] || "D"}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.firstName ? `DJ ${user.firstName}` : "DJ Dashboard"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-16 md:w-56 border-r border-gray-800 flex flex-col fixed h-[calc(100vh-64px)] z-20">
          <div className="p-3">
            <div className="hidden md:block text-xs font-medium text-gray-500 uppercase tracking-wider pb-4">
              Main
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedView("overview")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "overview"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("requests")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "requests"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <ListMusic className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Song Requests</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("library")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "library"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Music className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Music Library</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("earnings")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "earnings"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Earnings</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("analytics")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "analytics"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <BarChart2 className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Analytics</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="mt-6 p-3">
            <div className="hidden md:block text-xs font-medium text-gray-500 uppercase tracking-wider pb-4">
              Management
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedView("events")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "events"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Events</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("fans")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "fans"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Fan Management</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedView("venues")}
                  className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                    selectedView === "venues"
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline-block">Venues</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="mt-auto p-3">
            <div className="hidden md:flex flex-col bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Pro Features</h3>
                  <p className="text-xs text-gray-400">Upgrade for more</p>
                </div>
              </div>
              <button className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-md">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-16 md:pl-56 flex-1">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {selectedView === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">DJ Dashboard</h1>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium flex items-center"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Event
                      </motion.button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse h-28">
                          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Total Requests</p>
                            <h3 className="text-2xl font-bold mt-1">{stats.totalRequests}</h3>
                          </div>
                          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
                            <Music className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-gray-400">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">12%</span>
                          <span className="ml-1">vs last week</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Total Earnings</p>
                            <h3 className="text-2xl font-bold mt-1">${stats.earnings}</h3>
                          </div>
                          <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
                            <DollarSign className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-gray-400">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">24%</span>
                          <span className="ml-1">vs last month</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Completion Rate</p>
                            <h3 className="text-2xl font-bold mt-1">
                              {stats.totalRequests > 0
                                ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                                : 0}%
                            </h3>
                          </div>
                          <div className="p-3 bg-purple-500/20 text-purple-500 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-gray-400">
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                              style={{
                                width: `${
                                  stats.totalRequests > 0
                                    ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                          <h3 className="font-medium">Recent Song Requests</h3>
                          <button className="text-sm text-blue-400 hover:text-blue-300">
                            View all
                          </button>
                        </div>
                        
                        <div className="divide-y divide-gray-700/50">
                          {isLoading ? (
                            [...Array(5)].map((_, i) => (
                              <div key={i} className="p-4 animate-pulse">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                  </div>
                                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                                </div>
                              </div>
                            ))
                          ) : stats.topSongs?.length > 0 ? (
                            stats.topSongs.map((song, i) => (
                              <div key={i} className="p-4 hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Music className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{song.title}</p>
                                    <p className="text-sm text-gray-400">{song.artist}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-green-500">${song.amount}</p>
                                    <p className="text-xs text-gray-400">{song.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center">
                              <p className="text-gray-400">No song requests yet</p>
                              <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                                Create your first event
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                          <h3 className="font-medium">Performance Analytics</h3>
                          <div className="flex items-center space-x-2">
                            <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                              Week
                            </button>
                            <button className="text-xs bg-blue-600 px-2 py-1 rounded">
                              Month
                            </button>
                            <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                              Year
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                              <BarChart2 className="h-8 w-8 text-blue-400" />
                            </div>
                            <p className="mt-4 text-gray-400">
                              Analytics visualization will appear here
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50">
                          <h3 className="font-medium">Upcoming Events</h3>
                        </div>
                        
                        <div className="divide-y divide-gray-700/50">
                          {isLoading ? (
                            [...Array(3)].map((_, i) => (
                              <div key={i} className="p-4 animate-pulse">
                                <div className="flex items-start space-x-3">
                                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : stats.upcomingEvents?.length > 0 ? (
                            stats.upcomingEvents.map((event, i) => (
                              <div key={i} className="p-4 hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-start space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{event.name}</p>
                                    <p className="text-sm text-blue-400">{event.date}</p>
                                    <p className="text-xs text-gray-400">{event.venue}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center">
                              <p className="text-gray-400">No upcoming events</p>
                              <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                                Schedule a new event
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 border-t border-gray-700/50">
                          <button className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 rounded-lg hover:bg-gray-700/50 transition-colors">
                            View calendar
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50">
                          <h3 className="font-medium">Top Genres</h3>
                        </div>
                        
                        <div className="p-4">
                          {[
                            { name: "House", percent: 42 },
                            { name: "Hip Hop", percent: 28 },
                            { name: "Pop", percent: 15 },
                            { name: "RnB", percent: 10 },
                            { name: "Rock", percent: 5 },
                          ].map((genre, i) => (
                            <div key={i} className="mb-4 last:mb-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">{genre.name}</span>
                                <span className="text-sm text-gray-400">{genre.percent}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${genre.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {selectedView !== "overview" && (
                <motion.div
                  key={selectedView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[calc(100vh-140px)] flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                      {selectedView === "requests" ? (
                        <ListMusic className="h-10 w-10 text-blue-400" />
                      ) : selectedView === "library" ? (
                        <Music className="h-10 w-10 text-blue-400" />
                      ) : selectedView === "earnings" ? (
                        <DollarSign className="h-10 w-10 text-blue-400" />
                      ) : selectedView === "analytics" ? (
                        <BarChart2 className="h-10 w-10 text-blue-400" />
                      ) : selectedView === "events" ? (
                        <Calendar className="h-10 w-10 text-blue-400" />
                      ) : selectedView === "fans" ? (
                        <Users className="h-10 w-10 text-blue-400" />
                      ) : (
                        <Share2 className="h-10 w-10 text-blue-400" />
                      )}
                    </div>
                    <h2 className="mt-4 text-xl font-medium capitalize">{selectedView}</h2>
                    <p className="mt-2 text-gray-400 max-w-md">
                      This {selectedView} section is under development. Check back soon for updates!
                    </p>
                    <button
                      onClick={() => setSelectedView("overview")}
                      className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm inline-flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Go back to Overview
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for CheckCircle icon
function CheckCircle({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

// Helper component for Info icon
function Info({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}
