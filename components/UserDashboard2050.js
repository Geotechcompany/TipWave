"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, Share2, ChevronRight, 
  Bell, Settings, Calendar, Sparkles,
  ChevronDown, Search, Maximize, BarChart2,
  PlusCircle, UserCheck, History, PartyPopper,
  Info, User, Shield, Sun, Moon, Globe, Save,
  CreditCard, Volume2, VolumeX, Monitor, Menu,
  LogOut, Wallet, Plus, ArrowDownCircle, ArrowUpCircle,
  Download, Filter, Loader2
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
import { MobileSidebar } from "./user/MobileSidebar";
import { useSession, signOut } from 'next-auth/react';
import { AppLoader } from './AppLoader';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import DJApplicationForm from '@/components/DJApplicationForm';
import { useCurrency } from "@/context/CurrencyContext";
import { TopUpModal } from "./user/TopUpModal";
import { WalletTab } from "./user/WalletTab";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    songsRequested: 0,
    favoriteDJs: [],
    tipsThisMonth: 0
  });
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [availableDJs, setAvailableDJs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionType, setTransactionType] = useState("all");
  const { formatCurrency, defaultCurrency } = useCurrency();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/user');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }
        
        const data = await response.json();
        setUserStats(data);
        
        // Also fetch active requests with specific status filter
        const requestsResponse = await fetch('/api/user/requests?status=pending,accepted');
        
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch requests');
        }
        
        const requestsData = await requestsResponse.json();
        console.log('Active requests:', requestsData.requests); // Debug log
        
        // Make sure we're properly setting the active requests
        if (Array.isArray(requestsData.requests)) {
          setActiveRequests(requestsData.requests);
        } else {
          console.error('Expected requests array but got:', requestsData);
          setActiveRequests([]);
        }
        
        // Fetch recent activity and upcoming events
        fetchRecentActivity();
        fetchUpcomingEvents();
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Could not load your dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserStats();
    }
  }, [session]);

  // Fix the fetchRecentActivity function to better handle errors
  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/user/activity');
      if (!response.ok) {
        console.warn('Activity endpoint returned status:', response.status);
        setRecentActivity([]); // Set empty array instead of undefined
        return;
      }
      
      const data = await response.json();
      setRecentActivity(Array.isArray(data.activities) ? data.activities : []);
    } catch (error) {
      console.error('Error fetching activity:', error);
      // Instead of failing, just set an empty array
      setRecentActivity([]);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/user/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events');
      }
      
      const data = await response.json();
      console.log('Upcoming events:', data.events); // Debug log
      
      if (Array.isArray(data.events)) {
        setUpcomingEvents(data.events);
      } else {
        console.error('Expected events array but got:', data);
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast.error('Could not load upcoming events');
      setUpcomingEvents([]);
    }
  };

  useEffect(() => {
    fetchUserBalance();
  }, []);
  
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, transactionType]);

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await fetch("/api/user/balance");
      
      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }
      
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to load your account balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const typeParam = transactionType !== "all" ? `&type=${transactionType}` : '';
      const response = await fetch(`/api/user/transactions?page=${currentPage}&limit=5${typeParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleTopUpComplete = (newBalance) => {
    setBalance(newBalance);
    setShowTopUpModal(false);
    toast.success("Your account was successfully topped up!");
    // Refresh transactions to show the new top-up
    fetchTransactions();
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
        return <ArrowUpCircle className="h-5 w-5 text-green-400" />;
      case 'withdraw':
        return <ArrowDownCircle className="h-5 w-5 text-red-400" />;
      case 'tip':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const getTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case 'topup':
        return `Account Top-up (${transaction.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'})`;
      case 'withdraw':
        return 'Withdrawal to Bank Account';
      case 'tip':
        return transaction.djName ? `Tip to ${transaction.djName}` : 'Tip to DJ';
      default:
        return 'Transaction';
    }
  };
  
  const handleFilterChange = (type) => {
    setTransactionType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  if (status === "loading" || isLoading) {
    return <AppLoader />;
  }

  if (!session) {
    return null;
  }

  const handleViewAllActivity = () => {
    router.push('/activity');
  };

  const handleViewCalendar = () => {
    router.push('/events');
  };

  const handleBrowseEvents = () => {
    router.push('/events/browse');
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleChange = (setting, value) => {
    // This function is no longer used as settings are managed by the SettingsPanel
  };

  const handleSave = async () => {
    // This function is no longer used as settings are managed by the SettingsPanel
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

      toast.success('Song request submitted successfully!');
      setIsNewRequestModalOpen(false);
      // Refresh the stats/data after successful request
      fetchUserStats();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/auth/user');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
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
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt="Profile" 
                  width={50} 
                  height={50} 
                  className="rounded-full ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {session.user.name?.charAt(0) || "U"}
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
                Welcome, {session.user.name}
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
                onClick={() => setSelectedView("settings")}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <Settings className="h-5 w-5 text-gray-400" />
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

                      <button
                        onClick={() => setSelectedView("dj-application")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "dj-application"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Music className="h-5 w-5 text-purple-500" />
                        <span>DJ profile</span>
                      </button>

                      <button
                        onClick={() => setSelectedView("wallet")}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                          selectedView === "wallet"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        <span>Wallet</span>
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
                <div className="mt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
            {selectedView === "overview" ? (
              <>
                {/* Overview content */}
                <UserStats stats={userStats} isLoading={isLoading} />
                
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
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700 animate-pulse">
                            <div className="h-16 w-16 bg-gray-700 rounded-md"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
                              <div className="flex gap-2">
                                <div className="h-4 bg-gray-700 rounded w-12"></div>
                                <div className="h-4 bg-gray-700 rounded w-20"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : activeRequests && activeRequests.length > 0 ? (
                      <div className="space-y-4">
                        {activeRequests.map((request) => (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/30 transition-colors"
                          >
                            {/* Album Art */}
                            <div className="h-16 w-16 relative rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={request.albumArt || DEFAULT_ALBUM_ART}
                                alt={request.songTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{request.songTitle}</h3>
                              <p className="text-sm text-gray-400 truncate">{request.songArtist}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-blue-400 text-sm">${request.amount}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  request.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                                  request.status === 'accepted' ? 'bg-green-900/30 text-green-300' :
                                  'bg-blue-900/30 text-blue-300'
                                }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Request Time & DJ */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-gray-400">
                                {request.djName || 'Unknown DJ'}
                              </p>
                              <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                {request.createdAt && 
                                  formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })
                                }
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                            <Music className="h-8 w-8 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-300 mb-2">No Active Requests</h3>
                          <p className="text-gray-500 mb-6 max-w-sm">
                            Ready to make your first song request? Click below to get started!
                          </p>
                          <button
                            onClick={() => setIsNewRequestModalOpen(true)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group"
                          >
                            <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Make Your First Request
                          </button>
                        </motion.div>
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
                                <p className="text-xs text-gray-400">{new Date(event.startDate || event.date).toLocaleDateString()}</p>
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
                requests={activeRequests}
                isLoading={isLoading}
              />
            ) : selectedView === "history" ? (
              <ActivityTab activities={recentActivity} />
            ) : selectedView === "spending" ? (
              <SpendingAnalytics
                stats={userStats}
                isLoading={isLoading}
              />
            ) : selectedView === "analytics" ? (
              <BiddingAnalytics
                stats={userStats}
                isLoading={isLoading}
              />
            ) : selectedView === "trending" ? (
              <TrendingSongs
                stats={userStats}
                isLoading={isLoading}
              />
            ) : selectedView === "live" ? (
              <LiveDJs
                stats={userStats}
                isLoading={isLoading}
              />
            ) : selectedView === "playlists" ? (
              <SharedPlaylists
                stats={{
                  sharedPlaylists: Array.isArray(userStats.favoriteDJs) 
                    ? userStats.favoriteDJs.map(playlist => ({
                        id: playlist.id,
                        name: playlist.name,
                        creator: playlist.creator,
                        coverImage: playlist.coverImage,
                        songCount: playlist.songCount,
                        followers: playlist.followers,
                        likes: playlist.likes
                      }))
                    : []
                }}
                isLoading={isLoading}
              />
            ) : selectedView === "events" ? (
              <EventsTab events={upcomingEvents} />
            ) : selectedView === "settings" ? (
              <SettingsPanel 
                isOpen={true} 
                onClose={() => setSelectedView("dashboard")} 
              />
            ) : selectedView === "dj-application" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold">DJ Application</h2>
                      <p className="text-sm text-gray-400">Apply to become a DJ on our platform</p>
                    </div>
                  </div>
                  
                  <DJApplicationForm />
                </div>
              </motion.div>
            ) : selectedView === "wallet" ? (
              <WalletTab />
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
      >
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-gray-700 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 4a1 1 0 102 0V7a1 1 0 10-2 0v4z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </MobileSidebar>
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