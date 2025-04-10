import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";

// Import modular components
import AdminHeader from "./admin/AdminHeader";
import AdminSidebar from "./admin/AdminSidebar";
import AdminStats from "./admin/AdminStats";
import AdminRevenueChart from "./admin/AdminRevenueChart";
import AdminUsersList from "./admin/AdminUsersList";
import AdminSongsList from "./admin/AdminSongsList";
import AdminBidStatus from "./admin/AdminBidStatus";
import UserManagement from "./UserManagement";
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
      // Simulate endpoint calls since we need to create these admin endpoints
      const [statsResponse, usersResponse, songsResponse, bidsResponse] = await Promise.all([
        fetch(`/api/admin/stats?timeRange=${timeRange}`).catch(() => ({ ok: false })),
        fetch("/api/admin/users").catch(() => ({ ok: false })),
        fetch("/api/admin/songs").catch(() => ({ ok: false })),
        fetch("/api/admin/bids").catch(() => ({ ok: false }))
      ]);
      
      // Fallback to sample data if endpoints don't exist yet
      let statsData = { totalUsers: 1234, totalBids: 5678, totalSongs: 890, totalRevenue: 12345.67, activeDJs: 28 };
      let usersData = [];
      let songsData = [];
      let bidsData = [];
      
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      }
      
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
      }
      
      if (songsResponse.ok) {
        songsData = await songsResponse.json();
      }
      
      if (bidsResponse.ok) {
        bidsData = await bidsResponse.json();
      }
      
      // Generate sample data if API returns nothing
      const revenueByDay = statsData.revenueByDay || generateRevenueData();
      const recentUsers = usersData.length ? usersData.slice(0, 5) : generateMockUsers();
      const topSongs = songsData.length ? songsData.slice(0, 5) : generateMockSongs();
      const recentBids = bidsData.length ? bidsData.slice(0, 5) : generateMockBids();
      const userGrowth = statsData.userGrowth || []; 
      const bidsByStatus = statsData.bidsByStatus || { pending: 23, completed: 45, rejected: 12 };
      const notifications = statsData.notifications || [
        { id: 1, type: 'success', message: 'New DJ registered: DJ Quantum', time: '2m ago' },
        { id: 2, type: 'info', message: 'System maintenance scheduled for tomorrow', time: '1h ago' },
        { id: 3, type: 'alert', message: 'Failed payment detected for user #1234', time: '5h ago' }
      ];
      
      setStats({
        ...statsData,
        recentUsers,
        topSongs,
        recentBids,
        revenueByDay,
        userGrowth,
        bidsByStatus,
        notifications
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

  // Helper functions for generating mock data
  function generateRevenueData() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => ({
      day,
      amount: Math.floor(Math.random() * 1000) + 100
    }));
  }
  
  function generateMockUsers() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `user-${i}`,
      name: `User ${i + 1}`,
      email: `user${i+1}@example.com`,
      role: i % 3 === 0 ? "DJ" : "USER",
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      status: i % 4 === 0 ? "inactive" : "active"
    }));
  }
  
  function generateMockSongs() {
    const songs = [
      { title: "Blinding Lights", artist: "The Weeknd" },
      { title: "Dance Monkey", artist: "Tones and I" },
      { title: "Don't Start Now", artist: "Dua Lipa" },
      { title: "Watermelon Sugar", artist: "Harry Styles" },
      { title: "Levitating", artist: "Dua Lipa" }
    ];
    
    return songs.map((song, i) => ({
      id: `song-${i}`,
      title: song.title,
      artist: song.artist,
      requestCount: Math.floor(Math.random() * 100) + 10,
      totalBids: Math.floor(Math.random() * 5000) + 1000
    }));
  }
  
  function generateMockBids() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `bid-${i}`,
      song: `Song ${i + 1}`,
      amount: Math.floor(Math.random() * 50) + 10,
      user: `User ${i + 1}`,
      status: ["pending", "completed", "rejected"][i % 3],
      createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString()
    }));
  }

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