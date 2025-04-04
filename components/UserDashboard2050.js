import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, Share2, ChevronRight, 
  Bell, Settings, Calendar, Sparkles,
  ChevronDown, Search, Maximize, BarChart2,
  PlusCircle, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";

export default function UserDashboard2050() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalBids: 0,
    wonBids: 0,
    totalSpent: 0,
    activeBids: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  
  // Mock notifications - in a real app these would come from an API
  const notifications = [
    { id: 1, type: 'success', message: 'Your bid for "Uptown Funk" was accepted', time: '10m ago' },
    { id: 2, type: 'info', message: 'New DJ spotlight: DJ Quantum is now live', time: '2h ago' },
    { id: 3, type: 'alert', message: 'Your payment method will expire soon', time: '1d ago' }
  ];

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Failed to load your dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-600 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-cyan-400 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative"
            >
              {user?.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt="Profile" 
                  width={50} 
                  height={50} 
                  className="rounded-full ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-gray-900"></div>
            </motion.div>
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              >
                Welcome, {user?.firstName || user?.username || "User"}
              </motion.h1>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-sm"
              >
                Your personal music request hub
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search for songs..." 
                className="pl-10 pr-4 py-2 bg-gray-800/50 backdrop-blur-lg rounded-full border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-gray-800/50 backdrop-blur-lg hover:bg-gray-700/50 transition-all duration-200"
              >
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute right-0 mt-2 w-80 bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                      <span className="text-xs text-gray-400">Mark all as read</span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto py-2">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1.5 w-2 h-2 rounded-full ${
                              notification.type === 'success' ? 'bg-green-500' : 
                              notification.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-700 text-center">
                    <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors duration-150">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <button className="p-2 rounded-full bg-gray-800/50 backdrop-blur-lg hover:bg-gray-700/50 transition-all duration-200">
              <Settings className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="col-span-12 md:col-span-3 lg:col-span-2 hidden md:block"
          >
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg h-full overflow-hidden">
              <div className="p-4">
                <div className="space-y-1">
                  {[
                    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Overview", id: "overview" },
                    { icon: <Music className="h-5 w-5" />, label: "My Requests", id: "requests" },
                    { icon: <Clock className="h-5 w-5" />, label: "History", id: "history" },
                    { icon: <DollarSign className="h-5 w-5" />, label: "Spending", id: "spending" },
                    { icon: <BarChart2 className="h-5 w-5" />, label: "Analytics", id: "analytics" },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedView(item.id)}
                      className={`flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        selectedView === item.id 
                          ? "bg-blue-500/20 text-blue-300" 
                          : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      </div>
                      {selectedView === item.id && (
                        <div className="ml-auto w-1.5 h-5 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="px-4 mt-8">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
                  Discover
                </h3>
                <div className="space-y-1">
                  {[
                    { icon: <TrendingUp className="h-5 w-5" />, label: "Trending Songs" },
                    { icon: <Zap className="h-5 w-5" />, label: "Live DJs" },
                    { icon: <Share2 className="h-5 w-5" />, label: "Shared Playlists" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="flex items-center w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all duration-200"
                    >
                      {item.icon}
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 mt-12">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 p-4">
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <Sparkles className="h-6 w-6 text-blue-400 mb-2" />
                  <h3 className="text-sm font-medium text-white mb-1">Upgrade Your Experience</h3>
                  <p className="text-xs text-blue-200/80 mb-3">Get priority requests and exclusive features</p>
                  <button className="text-xs bg-blue-500/80 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg transition-colors duration-200">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
            {/* Stats Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { 
                  title: "Total Requests", 
                  value: stats.totalBids, 
                  icon: <Music className="h-5 w-5 text-blue-400" />,
                  color: "from-blue-500/20 to-blue-600/20",
                  border: "border-blue-500/20",
                  change: "+12%"
                },
                { 
                  title: "Accepted Requests", 
                  value: stats.wonBids, 
                  icon: <UserCheck className="h-5 w-5 text-green-400" />,
                  color: "from-green-500/20 to-green-600/20",
                  border: "border-green-500/20",
                  change: "+5%"
                },
                { 
                  title: "Total Spent", 
                  value: `$${stats.totalSpent.toFixed(2)}`, 
                  icon: <DollarSign className="h-5 w-5 text-amber-400" />,
                  color: "from-amber-500/20 to-amber-600/20",
                  border: "border-amber-500/20",
                  change: "+8%"
                },
                { 
                  title: "Active Requests", 
                  value: stats.activeBids?.length || 0, 
                  icon: <Clock className="h-5 w-5 text-purple-400" />,
                  color: "from-purple-500/20 to-purple-600/20",
                  border: "border-purple-500/20",
                  change: "0%"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`bg-gradient-to-br ${stat.color} backdrop-blur-lg rounded-2xl border ${stat.border} shadow-lg p-5 relative overflow-hidden`}
                >
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-100/5 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-gray-800/50 rounded-lg">{stat.icon}</div>
                    <div className="flex items-center space-x-1 bg-gray-900/40 rounded-full px-2 py-0.5 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">{stat.change}</span>
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {isLoading ? '...' : stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Active Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Active Requests</h2>
                    <p className="text-sm text-gray-400">Your current song requests</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors duration-200 flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Request
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : stats.activeBids && stats.activeBids.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-gray-700/50">
                          <th className="pb-3 font-medium">Song</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.activeBids.map((bid, index) => (
                          <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-700/10 transition-colors duration-150">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                  <Image 
                                    src={bid.song.albumArt || "/images/default-album-art.jpg"} 
                                    alt={bid.song.title}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium truncate max-w-xs">{bid.song.title}</p>
                                  <p className="text-sm text-gray-400 truncate max-w-xs">{bid.song.artist}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="font-medium">${bid.amount.toFixed(2)}</span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                bid.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                                bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {bid.status.toLowerCase()}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="text-gray-400 text-sm">
                                {new Date(bid.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button className="p-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Music className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active requests</h3>
                    <p className="text-gray-400 text-sm mb-4">Make a request to get your favorite songs played</p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200">
                      Make Your First Request
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Recent Activity and Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { 
                        title: "Your request for 'Blinding Lights' was played!",
                        time: "2 hours ago",
                        icon: <Music className="h-4 w-4 text-blue-400" />,
                        bg: "bg-blue-500/20"
                      },
                      { 
                        title: "You made a new request for 'As It Was'",
                        time: "Yesterday",
                        icon: <PlusCircle className="h-4 w-4 text-green-400" />,
                        bg: "bg-green-500/20"
                      },
                      { 
                        title: "You received a DJ recommendation",
                        time: "2 days ago",
                        icon: <UserCheck className="h-4 w-4 text-purple-400" />,
                        bg: "bg-purple-500/20"
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-2 ${activity.bg} rounded-full flex-shrink-0 mt-0.5`}>
                          {activity.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Upcoming Events</h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300">View calendar</button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { 
                        title: "90's Night with DJ Max",
                        date: "Tomorrow, 9PM - 1AM",
                        venue: "Electric Lounge, Downtown",
                        image: "/images/dj-event-1.jpg"
                      },
                      { 
                        title: "Summer Beach Party",
                        date: "Sat, Jul 15, 3PM - 10PM",
                        venue: "Sunset Beach Club",
                        image: "/images/dj-event-2.jpg"
                      },
                    ].map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-700/30 transition-colors duration-200 cursor-pointer">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-blue-300">{event.date}</p>
                          <p className="text-xs text-gray-400">{event.venue}</p>
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full mt-2 py-2.5 border border-gray-600 hover:border-gray-500 rounded-xl text-sm transition-colors duration-200">
                      Browse more events
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
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

// Helper component for MoreHorizontal icon
function MoreHorizontal({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  );
} 