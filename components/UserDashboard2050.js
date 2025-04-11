import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, Share2, ChevronRight, 
  Bell, Settings, Calendar, Sparkles,
  ChevronDown, Search, Maximize, BarChart2,
  PlusCircle, UserCheck, History, PartyPopper,
  Info, User, Shield, Sun, Moon, Globe, Save,
  CreditCard, Volume2, VolumeX, Monitor, Menu
} from "lucide-react";
import toast from "react-hot-toast";
import { MyRequests } from "./user/MyRequests";
import { RequestHistory } from "./user/RequestHistory";
import { SpendingAnalytics } from "./user/SpendingAnalytics";
import { BiddingAnalytics } from "./user/BiddingAnalytics";
import { UserStats } from "./user/UserStats";
import { TrendingSongs } from "./user/TrendingSongs";
import { LiveDJs } from "./user/LiveDJs";
import { SharedPlaylists } from "./user/SharedPlaylists";
import { UpgradeCard } from "./user/UpgradeCard";
import { NewRequestModal } from "./user/NewRequestModal";
import { ActivityTab } from './user/ActivityTab';
import { EventsTab } from './user/EventsTab';
import { SettingsPanel } from './user/SettingsPanel';
import { DEFAULT_ALBUM_ART } from '@/utils/constants';
import { useRouter } from "next/router";
import { MobileSidebar } from "./user/MobileSidebar";

export default function UserDashboard2050() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalBids: 0,
    wonBids: 0,
    totalSpent: 0,
    activeBids: [],
    pastBids: [],
    trendingSongs: [],
    liveDJs: [],
    sharedPlaylists: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [availableDJs, setAvailableDJs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    language: "english",
    displayMode: "system",
    privacyMode: "balanced"
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserStats(),
          fetchAvailableDJs(),
          fetchRecentActivity(),
          fetchUpcomingEvents(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
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

  const fetchAvailableDJs = async () => {
    try {
      const response = await fetch('/api/djs/available');
      if (!response.ok) {
        throw new Error('Failed to fetch DJs');
      }
      const data = await response.json();
      setAvailableDJs(data);
    } catch (error) {
      console.error('Error fetching DJs:', error);
      toast.error('Failed to load available DJs');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/user/recent-activity');
      if (!response.ok) throw new Error('Failed to fetch activity');
      const data = await response.json();
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to load recent activity');
      setRecentActivity([]);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/events/upcoming');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast.error('Failed to load upcoming events');
      setUpcomingEvents([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data || []);
      setNotificationCount(data.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  const handleNewRequest = async (requestData) => {
    try {
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      // Refresh the stats/data after successful request
      if (typeof onRequestCreated === 'function') {
        onRequestCreated();
      }
      
      toast.success('Song request submitted successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'PLAYED':
        return <Music className="h-4 w-4 text-blue-400" />;
      case 'REQUEST':
        return <PlusCircle className="h-4 w-4 text-green-400" />;
      case 'RECOMMENDATION':
        return <UserCheck className="h-4 w-4 text-purple-400" />;
      default:
        return <Music className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityBackground = (type) => {
    switch (type) {
      case 'PLAYED':
        return 'bg-blue-500/20';
      case 'REQUEST':
        return 'bg-green-500/20';
      case 'RECOMMENDATION':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    
    return 'just now';
  };

  // Navigation handlers for buttons
  const handleViewAllActivity = () => {
    router.push('/activity');
  };

  const handleViewCalendar = () => {
    router.push('/events');
  };

  const handleBrowseEvents = () => {
    router.push('/events/browse');
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      
      // Refresh notifications after marking as read
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      // Remove this notification from the local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
      
      // Here you could also add navigation logic based on notification type
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      // In a real implementation, you would save to an API
      // const response = await fetch('/api/user/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      // if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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
          {/* Mobile menu button - Add this first */}
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-300" />
            </motion.button>
          </div>

          {/* Existing user profile section */}
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
                className="p-2 rounded-full bg-gray-800/50 backdrop-blur-lg hover:bg-gray-700/50 transition-all duration-200"
                onClick={() => setSelectedView("settings")}
              >
                <Settings className="h-5 w-5 text-gray-300" />
              </button>
            </div>
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
                <div className="space-y-6">
                  <UpgradeCard />
                  
                  <div className="space-y-1">
                    <nav className="space-y-1">
                      <button
                        onClick={() => setSelectedView("overview")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "overview"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Overview</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("requests")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "requests"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Music className="h-5 w-5" />
                        <span>My Requests</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("history")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "history"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Clock className="h-5 w-5" />
                        <span>History</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("events")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "events"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Events</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("spending")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "spending"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span>Spending</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("analytics")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "analytics"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <BarChart2 className="h-5 w-5" />
                        <span>Analytics</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("settings")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "settings"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
              
              <div className="px-4 mt-8">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
                  Discover
                </h3>
                <div className="space-y-1">
                  {[
                    { 
                      icon: <TrendingUp className="h-5 w-5" />, 
                      label: "Trending Songs",
                      view: "trending"
                    },
                    { 
                      icon: <Zap className="h-5 w-5" />, 
                      label: "Live DJs",
                      view: "live" 
                    },
                    { 
                      icon: <Share2 className="h-5 w-5" />, 
                      label: "Shared Playlists",
                      view: "playlists" 
                    },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedView(item.view)}
                      className={`flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        selectedView === item.view 
                          ? 'bg-gray-700/50 text-gray-200' 
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
            {selectedView === "overview" ? (
              <>
                {/* Overview content */}
                <UserStats stats={stats} isLoading={isLoading} />
                
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
                      <button
                        onClick={() => setIsNewRequestModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        <PlusCircle className="h-4 w-4" />
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
                                        src={bid.song.albumArt || DEFAULT_ALBUM_ART} 
                                        alt={bid.song.title}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        unoptimized={bid.song.albumArt?.startsWith('http')}
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
                  {/* Recent Activity content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Recent Activity</h2>
                        <button 
                          onClick={handleViewAllActivity}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View all
                        </button>
                      </div>
                      
                      {recentActivity && recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.map((activity, index) => (
                            <div key={activity._id || index} className="flex items-start space-x-3">
                              <div className={`p-2 ${getActivityBackground(activity.type)} rounded-full flex-shrink-0 mt-0.5`}>
                                {getActivityIcon(activity.type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{activity.title}</p>
                                <p className="text-xs text-gray-400">{activity.timestamp || 'Just now'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-14 h-14 bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                            <History className="h-7 w-7 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-300 mb-1">No Recent Activity</h3>
                          <p className="text-xs text-gray-500 max-w-xs">
                            Activity will appear here as you interact with the platform.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Upcoming Events content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Upcoming Events</h2>
                        <button 
                          onClick={handleViewCalendar}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View calendar
                        </button>
                      </div>
                      
                      {upcomingEvents && upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingEvents.map((event, index) => (
                            <div key={event._id || index} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{event.title}</p>
                                <p className="text-xs text-gray-400">{new Date(event.startDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-3">
                            <PartyPopper className="h-7 w-7 text-blue-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-300 mb-1">No Upcoming Events</h3>
                          <p className="text-xs text-gray-500 max-w-xs">
                            Stay tuned for upcoming events.
                          </p>
                          <button 
                            onClick={handleBrowseEvents}
                            className="mt-4 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors duration-200"
                          >
                            Browse more events
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </>
            ) : selectedView === "requests" ? (
              <MyRequests
                requests={stats.activeBids}
                isLoading={isLoading}
              />
            ) : selectedView === "history" ? (
              <ActivityTab activities={recentActivity} />
            ) : selectedView === "spending" ? (
              <SpendingAnalytics
                stats={stats}
                isLoading={isLoading}
              />
            ) : selectedView === "analytics" ? (
              <BiddingAnalytics
                stats={stats}
                isLoading={isLoading}
              />
            ) : selectedView === "trending" ? (
              <TrendingSongs
                stats={stats}
                isLoading={isLoading}
              />
            ) : selectedView === "live" ? (
              <LiveDJs
                stats={stats}
                isLoading={isLoading}
              />
            ) : selectedView === "playlists" ? (
              <SharedPlaylists
                stats={{
                  sharedPlaylists: stats.sharedPlaylists?.map(playlist => ({
                    id: playlist.id,
                    name: playlist.name,
                    creator: playlist.creator,
                    coverImage: playlist.coverImage,
                    songCount: playlist.songCount,
                    followers: playlist.followers,
                    likes: playlist.likes
                  }))
                }}
                isLoading={isLoading}
              />
            ) : selectedView === "events" ? (
              <EventsTab events={upcomingEvents} />
            ) : selectedView === "settings" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-gray-400">Manage your account and preferences</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
                  <div className="flex">
                    {/* Settings Tabs */}
                    <div className="w-64 border-r border-gray-700 p-4">
                      <div className="space-y-1">
                        <button 
                          onClick={() => setActiveTab("account")}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                            activeTab === "account" ? "bg-blue-600/20 text-blue-500" : "hover:bg-gray-700/50"
                          }`}
                        >
                          <User className="h-5 w-5" />
                          <span>Account</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab("notifications")}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                            activeTab === "notifications" ? "bg-blue-600/20 text-blue-500" : "hover:bg-gray-700/50"
                          }`}
                        >
                          <Bell className="h-5 w-5" />
                          <span>Notifications</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab("privacy")}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                            activeTab === "privacy" ? "bg-blue-600/20 text-blue-500" : "hover:bg-gray-700/50"
                          }`}
                        >
                          <Shield className="h-5 w-5" />
                          <span>Privacy</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab("billing")}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                            activeTab === "billing" ? "bg-blue-600/20 text-blue-500" : "hover:bg-gray-700/50"
                          }`}
                        >
                          <CreditCard className="h-5 w-5" />
                          <span>Billing & Payments</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Settings Content */}
                    <div className="flex-1 p-6">
                      {activeTab === "account" && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Account Settings</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                              <input 
                                type="text" 
                                defaultValue={user?.firstName + " " + user?.lastName}
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                              <input 
                                type="email" 
                                defaultValue={user?.emailAddresses?.[0]?.emailAddress}
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                disabled
                              />
                              <p className="mt-1 text-xs text-gray-400">Email address cannot be changed</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                              <select 
                                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={settings.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                              >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="french">French</option>
                                <option value="german">German</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Display Mode</label>
                              <div className="grid grid-cols-3 gap-3 mt-2">
                                <button
                                  onClick={() => handleChange('displayMode', 'light')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.displayMode === 'light'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Sun className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Light</span>
                                </button>
                                
                                <button
                                  onClick={() => handleChange('displayMode', 'dark')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.displayMode === 'dark'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Moon className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Dark</span>
                                </button>
                                
                                <button
                                  onClick={() => handleChange('displayMode', 'system')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.displayMode === 'system'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Monitor className="h-6 w-6 mb-2" />
                                  <span className="text-sm">System</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === "notifications" && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Notification Preferences</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Email Notifications</h4>
                                <p className="text-sm text-gray-400">Receive bid updates via email</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.emailNotifications}
                                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Push Notifications</h4>
                                <p className="text-sm text-gray-400">Receive real-time alerts on your device</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.pushNotifications}
                                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Sound Effects</h4>
                                <p className="text-sm text-gray-400">Play sound when receiving notifications</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.soundEnabled}
                                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === "privacy" && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Privacy Settings</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Privacy Mode</label>
                              <div className="grid grid-cols-3 gap-3 mt-2">
                                <button
                                  onClick={() => handleChange('privacyMode', 'public')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.privacyMode === 'public'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Globe className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Public</span>
                                </button>
                                
                                <button
                                  onClick={() => handleChange('privacyMode', 'balanced')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.privacyMode === 'balanced'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Shield className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Balanced</span>
                                </button>
                                
                                <button
                                  onClick={() => handleChange('privacyMode', 'private')}
                                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                                    settings.privacyMode === 'private'
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                                  }`}
                                >
                                  <Shield className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Private</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === "billing" && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium">Billing & Payments</h3>
                          <div className="p-4 border border-gray-700 rounded-lg">
                            <p className="text-sm text-gray-400">
                              Manage your subscription and payment methods through our secure payment portal.
                            </p>
                            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                              Manage Subscription
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 px-6 py-4 flex justify-end">
                    <button 
                      onClick={handleSave}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2 inline-block" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleNewRequest}
        availableDJs={availableDJs}
      />
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
        selectedView={selectedView} 
        setSelectedView={setSelectedView} 
      />
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

// Helper functions for formatting time and date
function formatTimeAgo(timestamp) {
  const now = new Date();
  const diff = Math.floor((now - new Date(timestamp)) / 1000);

  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)} minutes ago`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hours ago`;
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)} days ago`;
  } else if (diff < 31536000) {
    return `${Math.floor(diff / 2592000)} months ago`;
  } else {
    return `${Math.floor(diff / 31536000)} years ago`;
  }
}

function formatEventDate(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  } else if (start.toLocaleDateString() === now.toLocaleDateString()) {
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  } else if (end.toLocaleDateString() === now.toLocaleDateString()) {
    return `${start.toLocaleDateString()} - ${end.toLocaleTimeString()}`;
  } else {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}

function getActivityBackground(type) {
  switch (type) {
    case 'request':
      return 'bg-blue-500/20';
    case 'recommendation':
      return 'bg-purple-500/20';
    case 'new_request':
      return 'bg-green-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

function getActivityIcon(type) {
  switch (type) {
    case 'request':
      return <Music className="h-4 w-4 text-blue-400" />;
    case 'recommendation':
      return <UserCheck className="h-4 w-4 text-purple-400" />;
    case 'new_request':
      return <PlusCircle className="h-4 w-4 text-green-400" />;
    default:
      return null;
  }
} 