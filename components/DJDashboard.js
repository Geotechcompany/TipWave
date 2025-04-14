import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, Share2, ChevronRight, 
  Bell, Settings, Calendar, BarChart2,
  ChevronDown, Search, Maximize, Users,
  PlusCircle, Headphones, ListMusic, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { CreateEventModal } from "./CreateEventModal";
import { RequestsPanel } from "./RequestsPanel";
import { LibraryPanel } from "./LibraryPanel";
import { EarningsPanel } from "./EarningsPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { EventsPanel } from "./EventsPanel";
import { FanManagementPanel } from "./FanManagementPanel";
import { VenuesPanel } from "./VenuesPanel";
import { SettingsPanel } from "./SettingsPanel";
import { useRouter } from 'next/router';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function DJDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    earnings: 0,
    upcomingEvents: [],
    topSongs: [],
    completionRate: 0,
    recentRequests: [],
    trends: {
      requests: 0,
      earnings: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [genres, setGenres] = useState([]);
  const [events, setEvents] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [analytics, setAnalytics] = useState({
    weeklyData: [],
    monthlyData: [],
    yearlyData: []
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  // Mock notifications - in a real app these would come from an API
  const mockNotifications = [
    { id: 1, type: 'success', message: 'New song request: "Dancing Queen" - $20 bid', time: '2m ago' },
    { id: 2, type: 'info', message: 'Venue "Pulse Nightclub" has booked you', time: '1h ago' },
    { id: 3, type: 'alert', message: 'Your profile is getting 45% more views this week', time: '5h ago' }
  ];

  useEffect(() => {
    if (user?.id) {
      const fetchStats = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/dj/${user.id}/stats`);
          if (!response.ok) {
            throw new Error('Failed to fetch stats');
          }
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error('Error fetching stats:', error);
          toast.error('Failed to load dashboard stats');
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchGenres();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchRecentRequests();
      fetchAnalytics(selectedTimeframe);
    }
  }, [user?.id, selectedTimeframe]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/dj/${user.id}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch(`/api/dj/${user.id}/genres`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      
      const data = await response.json();
      setGenres(data.topGenres);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Failed to load genre stats');
    }
  };

  const fetchEvents = async () => {
    try {
      setIsEventsLoading(true);
      const response = await fetch(`/api/dj/${user.id}/events?view=upcoming`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsEventsLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch(`/api/dj/${user.id}/requests/recent`);
      if (!response.ok) throw new Error('Failed to fetch recent requests');
      const data = await response.json();
      setRecentRequests(data.requests);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      toast.error('Failed to load recent requests');
    }
  };

  const fetchAnalytics = async (timeframe) => {
    try {
      const response = await fetch(`/api/dj/${user.id}/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/dj/${user.id}/notifications`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      
      setUnreadCount(0);
      fetchNotifications();
      toast.success('Marked all as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handlePanelToggle = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleCreateEvent = () => {
    setIsCreateEventModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const navigation = [
    {
      name: "Overview",
      icon: LayoutDashboard,
      href: "#",
      current: selectedView === "overview",
      onClick: () => setSelectedView("overview")
    },
    {
      name: "Song Requests",
      icon: Music,
      href: "#",
      current: selectedView === "requests",
      onClick: () => setSelectedView("requests")
    },
    {
      name: "Music Library",
      icon: ListMusic,
      href: "#",
      current: selectedView === "library",
      onClick: () => setSelectedView("library")
    },
    {
      name: "Earnings",
      icon: DollarSign,
      href: "#",
      current: selectedView === "earnings",
      onClick: () => setSelectedView("earnings")
    },
    {
      name: "Analytics",
      icon: BarChart2,
      href: "#",
      current: selectedView === "analytics",
      onClick: () => setSelectedView("analytics")
    }
  ];

  const managementNavigation = [
    { name: "Events", icon: Calendar, onClick: () => setSelectedView("events") },
    { name: "Fan Management", icon: Users, onClick: () => setSelectedView("fans") },
    { name: "Venues", icon: Share2, onClick: () => setSelectedView("venues") },
    { name: "Settings", icon: Settings, onClick: () => setSelectedView("settings") }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
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
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-blue-500 rounded-full text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-xl shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-medium">Notifications</h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="p-4 border-b border-gray-700/50 hover:bg-gray-800/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'success' ? 'bg-green-500/20 text-green-500' :
                            notification.type === 'info' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {notification.type === 'success' ? '✓' : 
                             notification.type === 'info' ? 'ℹ' : '⚠'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toRelativeTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedView("settings")}
              className="p-2 rounded-full hover:bg-gray-800"
            >
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 hover:bg-gray-800 rounded-full p-1"
              >
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
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-lg border border-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedView("settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => router.push('/api/auth/signout')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 text-red-400"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar - keep fixed position but adjust z-index */}
        <div className="w-16 md:w-56 border-r border-gray-800 flex flex-col fixed h-[calc(100vh-64px)] bg-gray-900 z-30">
          <div className="p-3">
            <div className="hidden md:block text-xs font-medium text-gray-500 uppercase tracking-wider pb-4">
              Main
            </div>
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={item.onClick}
                    className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                      selectedView === item.name.toLowerCase()
                        ? "bg-blue-900/20 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline-block">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 p-3">
            <div className="hidden md:block text-xs font-medium text-gray-500 uppercase tracking-wider pb-4">
              Management
            </div>
            <ul className="space-y-1">
              {managementNavigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={item.onClick}
                    className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                      selectedView === item.name.toLowerCase()
                        ? "bg-blue-900/20 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline-block">{item.name}</span>
                  </button>
                </li>
              ))}
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

        {/* Main content - add proper margin and padding */}
        <div className="flex-1 ml-16 md:ml-56">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              {selectedView === "analytics" ? (
                <AnalyticsPanel />
              ) : selectedView === "earnings" ? (
                <EarningsPanel />
              ) : selectedView === "requests" ? (
                <RequestsPanel />
              ) : selectedView === "library" ? (
                <LibraryPanel />
              ) : selectedView === "events" ? (
                <EventsPanel />
              ) : selectedView === "fans" ? (
                <FanManagementPanel />
              ) : selectedView === "venues" ? (
                <VenuesPanel />
              ) : selectedView === "settings" ? (
                <SettingsPanel />
              ) : selectedView === "overview" ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">DJ Dashboard</h1>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateEvent}
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
                          <TrendingUp className={`h-3 w-3 mr-1 ${
                            stats.trends.requests >= 0 ? 'text-green-500' : 'text-red-500'
                          }`} />
                          <span className={
                            stats.trends.requests >= 0 ? 'text-green-500' : 'text-red-500'
                          }>
                            {Math.abs(stats.trends.requests)}%
                          </span>
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
                          <TrendingUp className={`h-3 w-3 mr-1 ${
                            stats.trends.earnings >= 0 ? 'text-green-500' : 'text-red-500'
                          }`} />
                          <span className={
                            stats.trends.earnings >= 0 ? 'text-green-500' : 'text-red-500'
                          }>
                            {Math.abs(stats.trends.earnings)}%
                          </span>
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
                          <button 
                            onClick={() => setSelectedView("requests")}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
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
                          ) : recentRequests.length > 0 ? (
                            recentRequests.map((request, i) => (
                              <div key={i} className="p-4 hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Music className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{request.songTitle}</h4>
                                    <p className="text-sm text-gray-400">{request.requesterName}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="px-2 py-1 rounded-md bg-green-900/30 text-green-400 text-xs font-medium">
                                      ${request.amount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-400">No song requests yet</p>
                              <button 
                                onClick={() => setIsCreateEventModalOpen(true)}
                                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                              >
                                Create your first event
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 col-span-full">
                        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                            <h3 className="font-medium">Performance Analytics</h3>
                            <div className="flex space-x-2">
                              {['Week', 'Month', 'Year'].map((timeframe) => (
                                <button
                                  key={timeframe}
                                  onClick={() => setSelectedTimeframe(timeframe.toLowerCase())}
                                  className={`px-3 py-1 rounded-md text-sm ${
                                    selectedTimeframe === timeframe.toLowerCase()
                                      ? 'bg-blue-900/30 text-blue-400'
                                      : 'text-gray-400 hover:bg-gray-700/30'
                                  }`}
                                >
                                  {timeframe}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="p-6">
                            {isLoading ? (
                              <div className="animate-pulse">
                                <div className="h-[200px] bg-gray-700/50 rounded-lg" />
                              </div>
                            ) : analytics[`${selectedTimeframe}lyData`]?.length > 0 ? (
                              <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={analytics[`${selectedTimeframe}lyData`]}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <XAxis 
                                      dataKey="date" 
                                      stroke="#6B7280"
                                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem'
                                      }}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="amount"
                                      stroke="#3B82F6"
                                      fillOpacity={1}
                                      fill="url(#colorRevenue)"
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-400">No analytics data available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50">
                          <h3 className="font-medium">Upcoming Events</h3>
                        </div>
                        <div className="p-4">
                          {isEventsLoading ? (
                            <div className="animate-pulse space-y-4">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-700/50 rounded-lg" />
                              ))}
                            </div>
                          ) : events.length > 0 ? (
                            <div className="space-y-4">
                              {events.map((event, i) => (
                                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{event.name}</h4>
                                    <p className="text-sm text-gray-400">
                                      {new Date(event.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-400">No upcoming events</p>
                              <button 
                                onClick={() => setIsCreateEventModalOpen(true)}
                                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                              >
                                Schedule a new event
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-gray-700/50">
                          <button 
                            onClick={() => setSelectedView("events")}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            View calendar
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-700/50">
                          <h3 className="font-medium">Top Genres</h3>
                        </div>
                        <div className="p-4">
                          {isLoading ? (
                            <div className="animate-pulse space-y-4">
                              {[...Array(5)].map((_, i) => (
                                <div key={i}>
                                  <div className="h-4 bg-gray-700/50 rounded w-20 mb-1" />
                                  <div className="h-2 bg-gray-700/50 rounded" />
                                </div>
                              ))}
                            </div>
                          ) : genres.length > 0 ? (
                            <div className="space-y-4">
                              {genres.map((genre, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>{genre.name}</span>
                                    <span>{genre.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                      style={{ width: `${genre.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-400">No genre data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <CreateEventModal 
        isOpen={isCreateEventModalOpen} 
        onClose={() => setIsCreateEventModalOpen(false)} 
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
