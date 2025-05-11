"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Shield,
  Database,
} from "lucide-react";

// Import admin components
import AdminHeader from "./admin/AdminHeader";
import AdminSidebar from "./admin/AdminSidebar";
import { MobileAdminSidebar } from "./admin/MobileAdminSidebar";
import AdminStats from "./admin/AdminStats";
import AdminRevenueChart from "./admin/AdminRevenueChart";
import AdminUsersList from "./admin/AdminUsersList";
import AdminSongsList from "./admin/AdminSongsList";
import AdminBidStatus from "./admin/AdminBidStatus";
import SongManagement from "./admin/SongManagement";
import BidManagement from "./admin/BidManagement";
import AnalyticsView from "./admin/AnalyticsView";
import SettingsView from "./admin/SettingsView";
import { AppLoader } from "./AppLoader";
import DJApplicationsReview from "./admin/DJApplicationsReview";
import UserManagement from "./admin/UserManagement";
import EmailManagement from "./admin/EmailManagement";
import PaymentMethodManagement from "./admin/PaymentMethodManagement";
import WithdrawalMethodsManagement from "./admin/WithdrawalMethodsManagement";
import WithdrawalManagement from "./admin/WithdrawalManagement";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/admin?redirected=true');
    },
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Admin stats state with proper initialization
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBids: 0,
    totalSongs: 0,
    totalRevenue: 0,
    activeDJs: 0,
    recentUsers: [],
    topSongs: [],
    recentBids: [],
    userGrowth: [],
    revenueByDay: [],
    bidsByStatus: { pending: 0, completed: 0, rejected: 0 },
    notifications: [],
    events: [],
    emailStats: { sent: 0, failed: 0, scheduled: 0 }
  });

  const [defaultCurrency, setDefaultCurrency] = useState({
    code: 'USD',
    symbol: '$',
    rate: 1
  });
  
  const fetchDefaultCurrency = useCallback(async () => {
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
  }, []);

  // Define fetchAdminData before using it in useEffect
  const fetchAdminData = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    
    try {
      setRefreshing(true);
      
      await fetchDefaultCurrency();
      
      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [timeRange, session?.user?.id, fetchDefaultCurrency, status]);

  // Improve session check with better error handling
  useEffect(() => {
    if (status === "loading") {
      // Show loading state while verifying session
      setIsLoading(true);
      return;
    }
    
    if (status === "unauthenticated") {
      console.log("Session is unauthenticated, redirecting to login...");
      router.push('/auth/admin?session=expired');
      return;
    }
    
    // Verify admin role once session is loaded
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      console.log("User is not an admin, redirecting...", session?.user);
      toast.error('Admin access required');
      router.push('/');
      return;
    }
    
    // Session is valid and user is admin, proceed with fetching data
    console.log("Admin session verified successfully");
    fetchAdminData();
  }, [status, session, router, fetchAdminData]);

  // Enhance the session refresh approach
  useEffect(() => {
    // More aggressive session refresh - every 1 minute
    const interval = setInterval(async () => {
      try {
        if (status === "authenticated") {
          // Use a more forceful approach to refresh the session
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            console.warn('Session refresh response not OK:', response.status);
          } else {
            const data = await response.json();
            if (!data?.user) {
              console.warn('Session exists but user data is missing');
            }
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, 60 * 1000); // Every 1 minute
    
    return () => clearInterval(interval);
  }, [status]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAdminData();
    toast.success("Dashboard data refreshed");
    setRefreshing(false);
  };

  // Handle clicks outside menu components
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // eslint-disable-next-line no-unused-vars
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const ProfileSection = () => (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={session?.user?.image || "/default-avatar.png"}
            alt={session?.user?.name || "Admin"}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-xs text-gray-400">{session?.user?.email}</p>
        </div>
      </button>
      {/* Rest of profile menu */}
    </div>
  );

  if (status === "loading" || isLoading) {
    return <AppLoader />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <AdminHeader 
        user={session?.user}
        signOut={handleSignOut}
        refreshData={refreshData}
        refreshing={refreshing}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationsRef={notificationsRef}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        profileMenuRef={profileMenuRef}
        stats={stats}
        setActiveTab={setActiveTab}
      />

      <div className="flex pt-16 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileAdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:ml-56">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminStats 
                stats={stats}
                isLoading={isLoading}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                defaultCurrency={defaultCurrency}
              />
              
              <AdminRevenueChart 
                stats={stats}
                isLoading={isLoading}
                defaultCurrency={defaultCurrency}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AdminUsersList stats={stats} isLoading={isLoading} />
                <AdminSongsList stats={stats} isLoading={isLoading} />
                <AdminBidStatus stats={stats} isLoading={isLoading} />
              </div>
            </motion.div>
          )}
          
          {activeTab === "users" && <UserManagement defaultCurrency={defaultCurrency} />}
          {activeTab === "songs" && <SongManagement defaultCurrency={defaultCurrency} />}
          {activeTab === "bids" && <BidManagement defaultCurrency={defaultCurrency} />}
          {activeTab === "analytics" && <AnalyticsView defaultCurrency={defaultCurrency} />}
          {activeTab === "settings" && <SettingsView defaultCurrency={defaultCurrency} />}
          {activeTab === "content" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Content Moderation</h2>
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Content moderation module not available</h3>
                <p className="text-gray-400">This feature is coming soon.</p>
              </div>
            </div>
          )}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">System Statistics</h2>
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">System stats module not available</h3>
                <p className="text-gray-400">This feature is coming soon.</p>
              </div>
            </div>
          )}
          {activeTab === "djapplications" && <DJApplicationsReview defaultCurrency={defaultCurrency} />}
          {activeTab === "emails" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EmailManagement 
                stats={stats} 
                refreshData={refreshData} 
                defaultCurrency={defaultCurrency} 
              />
            </motion.div>
          )}
          {activeTab === "payment-methods" && <PaymentMethodManagement defaultCurrency={defaultCurrency} />}
          {activeTab === "withdrawal-methods" && <WithdrawalMethodsManagement defaultCurrency={defaultCurrency} />}
          {activeTab === "withdrawals" && <WithdrawalManagement defaultCurrency={defaultCurrency} />}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function StatCard({ title, value, icon: Icon, trend }) {
  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className={`text-sm ${trendColor} flex items-center`}>
          {trend}%
          <TrendingUp className="w-4 h-4 ml-1" />
        </p>
      </div>
    </div>
  );
}