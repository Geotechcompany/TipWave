"use client";

import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { 
  Music, DollarSign, 
  Zap, Bell, Settings, Calendar, 
  BarChart2, Users, PlusCircle, ListMusic, 
  Loader2, CheckCircle, Home, Menu, Wallet, MapPin
} from "lucide-react";

import { CreateEventModal } from "./CreateEventModal";
import { RequestsPanel } from "./RequestsPanel";
import { LibraryPanel } from "./LibraryPanel";
import { EarningsPanel } from "./EarningsPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { EventsPanel } from "./EventsPanel";
import { FanManagementPanel } from "./FanManagementPanel";
import { VenuesPanel } from "./VenuesPanel";
import { SettingsPanel } from "./SettingsPanel";


import { MobileSidebar } from './MobileSidebar';
import { DashboardOverview } from './DashboardOverview';
import { WithdrawalTransactions } from "./WithdrawalTransactions";

const safelyAccessNestedProperty = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  const keys = path.split('.');
  return keys.reduce((acc, key) => 
    acc && acc[key] !== undefined ? acc[key] : defaultValue
  , obj);
};

export default function DJDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalEarnings: 0,
    upcomingEvents: [],
    topSongs: [],
    completionRate: 0,
    recentRequests: [],
    trends: {
      requests: 0,
      earnings: 0
    },
    events: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [recentRequests, setRecentRequests] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState({
    code: 'USD',
    symbol: '$',
    rate: 1
  });
  const [isOpen, setIsOpen] = useState(false);
  
  // Memoize all the fetch functions to use in dependency arrays
  const fetchDJStats = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const { data } = await response.json();
      setStats({
        totalRequests: safelyAccessNestedProperty(data, 'totalRequests', 0),
        acceptedRequests: safelyAccessNestedProperty(data, 'acceptedRequests', 0),
        rejectedRequests: safelyAccessNestedProperty(data, 'rejectedRequests', 0),
        totalEarnings: safelyAccessNestedProperty(data, 'totalEarnings', 0),
        upcomingEvents: safelyAccessNestedProperty(data, 'upcomingEvents', []),
        topSongs: safelyAccessNestedProperty(data, 'topSongs', []),
        completionRate: safelyAccessNestedProperty(data, 'completionRate', 0),
        recentRequests: safelyAccessNestedProperty(data, 'recentRequests', []),
        trends: safelyAccessNestedProperty(data, 'trends', { requests: 0, earnings: 0 }),
        events: safelyAccessNestedProperty(data, 'events', [])
      });
    } catch (error) {
      console.error('Error fetching DJ stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/dj/${session?.user?.id}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      
      // Check if data exists and has notifications property
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setUnreadCount(0);
    }
  }, [session?.user?.id]);

  const fetchRecentRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/dj/${session?.user?.id}/requests?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch recent requests');
      const data = await response.json();
      
      // Check if data exists and has requests property
      setRecentRequests(data?.data?.requests || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      setRecentRequests([]);
    }
  }, [session?.user?.id]);

  const fetchDefaultCurrency = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/admin/currencies');
      if (!response.ok) throw new Error('Failed to fetch currencies');
      
      const data = await response.json();
      const currencies = data.currencies || [];
      
      const defaultCurr = currencies.find(curr => curr.isDefault) || 
                        currencies.find(curr => curr.code === 'USD') ||
                        (currencies.length > 0 ? currencies[0] : { code: 'USD', symbol: '$', rate: 1 });
      
      setDefaultCurrency(defaultCurr);
    } catch (error) {
      console.error('Error fetching default currency:', error);
    }
  }, [session?.user?.id]);

  // Format currency is used in DashboardOverview
  const formatCurrency = useCallback((amount) => {
    return `${defaultCurrency.symbol}${parseFloat(amount || 0).toFixed(2)}`;
  }, [defaultCurrency.symbol]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/dj');
    } else if (session?.user?.id) {
      fetchDJStats();
    }
  }, [status, session?.user?.id, router, fetchDJStats]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecentRequests();
    }
  }, [session?.user?.id, fetchRecentRequests]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDefaultCurrency();
    }
  }, [session?.user?.id, fetchDefaultCurrency]);

  // Handle notifications
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      await fetch(`/api/dj/${session.user.id}/notifications/mark-read`, {
        method: 'POST'
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [session?.user?.id]);

  // Event handlers used in the UI
  const handleCreateEvent = useCallback(() => {
    setIsCreateEventModalOpen(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Add notifications dropdown with markAllAsRead functionality
  const NotificationsDropdown = () => (
    showNotifications && (
      <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-xl shadow-lg border border-gray-700 z-50">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-medium">Notifications</h3>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Mark all as read
          </button>
        </div>
        <div className="p-4">
          {unreadCount === 0 ? (
            <p className="text-sm text-gray-400">No new notifications</p>
          ) : (
            <p className="text-sm text-gray-400">{unreadCount} unread notifications</p>
          )}
        </div>
      </div>
    )
  );

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Navigation menu items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'requests', label: 'Song Requests', icon: Music },
    { id: 'library', label: 'Music Library', icon: ListMusic },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'fans', label: 'Fans', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'venues', label: 'Venues', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Mobile sidebar */}
      <MobileSidebar 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeView={selectedView} 
        onViewChange={setSelectedView}
      />

      {/* Main layout */}
      <div className="flex">
        {/* Desktop Navigation - hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-64 h-screen bg-gray-900 border-r border-gray-800 sticky top-0">
          {/* Logo/Brand section */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">DJ Dashboard</h1>
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = selectedView === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setSelectedView(item.id)}
                      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-600/20 text-blue-400' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Upgrade Banner */}
          <div className="mt-auto px-3 pb-4">
            <div className="rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center mb-3">
                  <Zap className="h-5 w-5 text-yellow-300 mr-2" />
                  <h3 className="font-bold text-white">Upgrade to Pro</h3>
                </div>
                
                <p className="text-sm text-white/80 mb-3">
                  Unlock premium features and boost your earnings
                </p>
                
                <ul className="text-xs text-white/80 mb-4 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                    <span>Priority requests</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1">
          {/* Header */}
          <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Mobile menu button - only show on mobile */}
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg"
                >
                  <Menu size={20} />
                </button>

                {/* Right side header items */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* Create Event button */}
                  <button
                    onClick={() => setIsCreateEventModalOpen(true)}
                    className="inline-flex items-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle size={18} className="md:mr-2" />
                    <span className="hidden md:inline">Create Event</span>
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                      aria-label="Notifications"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationsDropdown />
                  </div>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={session?.user?.image || "/default-avatar.png"}
                          alt={session?.user?.name || "DJ"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </button>
                    
                    {/* Profile dropdown menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-lg border border-gray-700 z-50">
                        <div className="p-3 border-b border-gray-800">
                          <p className="font-medium text-sm">{session?.user?.name}</p>
                          <p className="text-xs text-gray-400">{session?.user?.email}</p>
                        </div>
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
                            onClick={handleSignOut}
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
          </header>
          
          {/* Main content */}
          <div className="container mx-auto px-4 py-8">
            {/* Dashboard content - render based on selected view */}
            <div className="mt-4">
              {selectedView === "overview" && (
                <DashboardOverview 
                  stats={stats}
                  recentRequests={recentRequests}
                  defaultCurrency={defaultCurrency}
                  isLoading={isLoading}
                  formatCurrency={formatCurrency}
                />
              )}
              
              {selectedView === "requests" && (
                <RequestsPanel 
                  defaultCurrency={defaultCurrency}
                />
              )}
              
              {selectedView === "library" && (
                <LibraryPanel />
              )}
              
              {selectedView === "earnings" && (
                <>
                  <EarningsPanel 
                    defaultCurrency={defaultCurrency}
                  />
                  <div className="mt-8">
                    <WithdrawalTransactions 
                      defaultCurrency={defaultCurrency}
                    />
                  </div>
                </>
              )}
              
              {selectedView === "analytics" && (
                <AnalyticsPanel 
                  defaultCurrency={defaultCurrency}
                />
              )}
              
              {selectedView === "events" && (
                <EventsPanel />
              )}
              
              {selectedView === "fans" && (
                <FanManagementPanel />
              )}
              
              {selectedView === "settings" && (
                <SettingsPanel />
              )}

              {selectedView === "withdrawals" && (
                <WithdrawalTransactions 
                  defaultCurrency={defaultCurrency}
                />
              )}

              {selectedView === "venues" && (
                <VenuesPanel />
              )}
            </div>
          </div>
        </main>
      </div>
      
      <CreateEventModal 
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
