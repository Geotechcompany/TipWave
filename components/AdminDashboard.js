import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";

// Import admin components
import AdminHeader from "./admin/AdminHeader";
import AdminSidebar from "./admin/AdminSidebar";
import AdminStats from "./admin/AdminStats";
import AdminRevenueChart from "./admin/AdminRevenueChart";
import AdminUsersList from "./admin/AdminUsersList";
import AdminSongsList from "./admin/AdminSongsList";
import AdminBidStatus from "./admin/AdminBidStatus";
import UserManagement from "./admin/UserManagement";
import SongManagement from "./admin/SongManagement";
import BidManagement from "./admin/BidManagement";
import AnalyticsView from "./admin/AnalyticsView";
import SettingsView from "./admin/SettingsView";

export default function AdminDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Admin stats state
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
    notifications: []
  });

  // Fetch admin data
  useEffect(() => {
    fetchAdminData();
  }, [timeRange]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch notifications separately
      const notificationsResponse = await fetch('/api/admin/notifications');
      if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications');
      const notificationsData = await notificationsResponse.json();

      // Fetch other stats
      const statsResponse = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();

      // Update stats with real notifications data
      setStats({
        ...statsData,
        notifications: notificationsData.notifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          message: notification.message,
          time: formatNotificationTime(notification.createdAt)
        }))
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Add helper function for formatting notification time
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

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <AdminHeader 
        user={user}
        signOut={signOut}
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
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 p-6 ml-16 md:ml-56">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <AdminStats 
                stats={stats}
                isLoading={isLoading}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />
              
              <AdminRevenueChart 
                stats={stats}
                isLoading={isLoading}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AdminUsersList 
                  stats={stats}
                  isLoading={isLoading}
                />
                
                <AdminSongsList 
                  stats={stats}
                  isLoading={isLoading}
                />
                
                <AdminBidStatus 
                  stats={stats}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
          
          {activeTab === "users" && <UserManagement />}
          {activeTab === "songs" && <SongManagement />}
          {activeTab === "bids" && <BidManagement />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </div>
    </div>
  );
}