import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Music,
  Users,
  BarChartIcon,
  Settings,
  DollarSign,
  Bell,
  ChevronDown,
  Check,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Info,
  Globe,
  AlertTriangle,
  Shield,
  UserCheck,
  PlusCircle,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import { StatCard } from './StatCard';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from "react-hot-toast";
import Link from "next/link";


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Admin stats state
  const [adminStats, setAdminStats] = useState({
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

  const navigationItems = [
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { tab: "songs", label: "Songs", icon: <Music className="w-5 h-5" /> },
    { tab: "bids", label: "Bids", icon: <DollarSign className="w-5 h-5" /> },
    { tab: "analytics", label: "Analytics", icon: <BarChartIcon className="w-5 h-5" /> },
    { tab: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];
  
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
      
      // Generate sample data for visualization
      const userGrowth = generateUserGrowthData(timeRange);
      const revenueByDay = generateRevenueData();
      
      setAdminStats({
        totalUsers: statsData.totalUsers,
        totalBids: statsData.totalBids,
        totalSongs: statsData.totalSongs,
        totalRevenue: statsData.totalRevenue,
        activeDJs: statsData.activeDJs,
        recentUsers: usersData.slice(0, 5) || generateSampleUsers(5),
        topSongs: songsData.slice(0, 5) || generateSampleSongs(5),
        recentBids: bidsData.slice(0, 5) || generateSampleBids(5),
        userGrowth,
        revenueByDay,
        bidsByStatus: {
          pending: Math.floor(statsData.totalBids * 0.3),
          completed: Math.floor(statsData.totalBids * 0.6),
          rejected: Math.floor(statsData.totalBids * 0.1)
        },
        notifications: [
          { id: 1, type: 'alert', message: 'New DJ signup from Los Angeles', time: '10 minutes ago' },
          { id: 2, type: 'info', message: 'System maintenance scheduled for Sunday', time: '1 hour ago' },
          { id: 3, type: 'success', message: 'Payment processing completed', time: '3 hours ago' }
        ]
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin dashboard data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  // Chart data for revenue trends
  const revenueChartData = {
    labels: adminStats.revenueByDay.map(day => day.date),
    datasets: [
      {
        label: 'Revenue',
        data: adminStats.revenueByDay.map(day => day.amount),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4,
      }
    ]
  };
  
  // Chart data for user growth
  const userGrowthChartData = {
    labels: adminStats.userGrowth.map(day => day.date),
    datasets: [
      {
        label: 'New Users',
        data: adminStats.userGrowth.map(day => day.newUsers),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  // Chart data for bid status distribution
  const bidStatusChartData = {
    labels: ['Pending', 'Completed', 'Rejected'],
    datasets: [
      {
        data: [
          adminStats.bidsByStatus.pending,
          adminStats.bidsByStatus.completed,
          adminStats.bidsByStatus.rejected
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Time Range Selector */}
            <div className="flex justify-end">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md text-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={adminStats.totalUsers.toLocaleString()}
                icon={<Users className="w-6 h-6 text-indigo-600" />}
                change="12"
                trend="up"
              />
              <StatCard
                title="Total Bids"
                value={adminStats.totalBids.toLocaleString()}
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                change="8"
                trend="up"
              />
              <StatCard
                title="Active DJs"
                value={adminStats.activeDJs.toLocaleString()}
                icon={<Music className="w-6 h-6 text-purple-600" />}
                change="15"
                trend="up"
              />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Revenue Overview</h2>
                <div className="text-sm text-gray-500 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{Math.floor(Math.random() * 15) + 5}%</span>
                  <span className="ml-1">vs last {timeRange}</span>
                </div>
              </div>
              <div className="h-80">
                <Line
                  data={revenueChartData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value;
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return '$' + context.parsed.y;
                          }
                        }
                      }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            {/* User Growth and Bid Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                <div className="h-64">
                  <Bar
                    data={userGrowthChartData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>

              {/* Bid Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Bid Status</h2>
                <div className="h-64">
                  <Doughnut
                    data={bidStatusChartData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      },
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity and Top Songs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bids */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Recent Bids</h2>
                </div>
                <div className="p-6">
                  {adminStats.recentBids && adminStats.recentBids.length > 0 ? (
                    <div className="space-y-4">
                      {adminStats.recentBids.map((bid, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative">
                              <Image
                                src={bid.userImage || "/images/default-avatar.png"}
                                alt={bid.userName}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{bid.songTitle}</p>
                              <p className="text-xs text-gray-500">by {bid.userName}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            ${bid.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No recent bids to display</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Songs */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Top Songs</h2>
                </div>
                <div className="p-6">
                  {adminStats.topSongs && adminStats.topSongs.length > 0 ? (
                    <div className="space-y-4">
                      {adminStats.topSongs.map((song, index) => (
                        <div key={index} className="flex items-center">
                          <div className="text-lg font-bold text-gray-400 w-8">{index + 1}</div>
                          <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden relative">
                            <Image
                              src={song.albumArt || "/images/default-album-art.jpg"}
                              alt={song.title}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{song.title}</p>
                            <p className="text-xs text-gray-500">{song.artist}</p>
                          </div>
                          <div className="ml-auto text-sm text-gray-500">{song.bidCount} bids</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No top songs to display</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "songs":
        return <SongsManagement />;
      case "bids":
        return <BidsManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "settings":
        return <AdminSettings />;
      default:
        return null;
    }
  };

  const profileImageUrl = user?.imageUrl || "https://via.placeholder.com/64";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "admin@example.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              DJ TipSync Admin
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`${
                    activeTab === item.tab
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md w-full transition-all duration-200`}
                >
                  <span className={`${activeTab === item.tab ? "text-indigo-700" : "text-gray-400 group-hover:text-gray-500"} mr-3`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Admin Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Image
                  src={profileImageUrl}
                  alt={user?.fullName || "Admin"}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-indigo-100"
                />
                <span className="absolute top-0 right-0 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {user?.fullName || "Admin User"}
              </h3>
              <p className="text-xs text-gray-500">{userEmail}</p>
              <button
                onClick={() => signOut()}
                className="mt-3 w-full bg-indigo-600 text-white rounded-md py-2 text-sm hover:bg-indigo-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <button 
                  onClick={handleRefresh}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-5 h-5" />
                    {adminStats.notifications.length > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        <button className="text-gray-400 hover:text-gray-500 text-xs">
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {adminStats.notifications.map(notification => (
                          <div
                            key={notification.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                          >
                            <button className="w-full p-3 text-left flex">
                              <div className="mr-3 mt-0.5">
                                {notification.type === 'alert' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                {notification.type === 'success' && <Check className="w-5 h-5 text-green-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                      <a
                        href="#"
                        className="block bg-gray-50 text-center py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        View all notifications
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          {/* Dashboard Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components for placeholder content
function UserManagement() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">User Management</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
        <p className="text-gray-600">Full user management interface will be implemented here.</p>
      </div>
    </div>
  );
}

function SongsManagement() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Song Management</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search songs..."
                className="pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
        <p className="text-gray-600">Full song management interface will be implemented here.</p>
      </div>
    </div>
  );
}

function BidsManagement() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Bid Management</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bids..."
                className="pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
        <p className="text-gray-600">Full bid management interface will be implemented here.</p>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Detailed Analytics</h2>
          <div className="flex items-center space-x-3">
            <select className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>
            <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">User Acquisition Channels</h3>
            <div className="h-64">
              <Doughnut 
                data={{
                  labels: ['Direct', 'Referral', 'Social', 'Organic Search', 'Paid Ads'],
                  datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Bid Conversion Rate</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [{
                    label: 'Conversion Rate (%)',
                    data: [65, 72, 68, 75, 82, 85],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)'
                  }]
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  },
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Platform Usage by Hour</h3>
          <div className="h-64">
            <Line
              data={{
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                  label: 'Active Users',
                  data: [30, 25, 20, 15, 10, 15, 25, 40, 60, 80, 95, 110, 120, 115, 110, 100, 95, 90, 85, 80, 70, 60, 50, 40],
                  borderColor: 'rgba(59, 130, 246, 1)',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">User Retention</h3>
            <p className="text-2xl font-bold">76%</p>
            <p className="text-xs text-gray-500">Weekly active users returning</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Session</h3>
            <p className="text-2xl font-bold">18m 32s</p>
            <p className="text-xs text-gray-500">Time spent on platform</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bounce Rate</h3>
            <p className="text-2xl font-bold">22.4%</p>
            <p className="text-xs text-gray-500">Single page sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6">System Settings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-md font-medium mb-4 pb-2 border-b">Platform Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="DJ TipSync"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="support@djtipsync.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="maintenance-mode"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-700">
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-4 pb-2 border-b">Payment Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Fee (%)
                </label>
                <input
                  type="number"
                  defaultValue="2.5"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Bid Amount
                </label>
                <input
                  type="number"
                  defaultValue="1.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Threshold
                </label>
                <input
                  type="number"
                  defaultValue="50.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="auto-payout"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked
                />
                <label htmlFor="auto-payout" className="ml-2 block text-sm text-gray-700">
                  Enable Automatic Payouts
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t flex justify-end">
          <button className="px-4 py-2 mr-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Reset to Defaults
          </button>
          <button className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for generating sample data
function generateSampleSongs(count) {
  const songs = [];
  
  for (let i = 0; i < count; i++) {
    songs.push({
      title: `Song Title ${i+1}`,
      artist: `Artist ${i+1}`,
      albumArt: `/images/default-album-art.jpg`,
      bidCount: Math.floor(Math.random() * 50) + 5
    });
  }
  
  return songs;
}

function generateSampleBids(count) {
  const statuses = ['pending', 'completed', 'completed', 'completed', 'rejected'];
  const bids = [];
  
  for (let i = 0; i < count; i++) {
    bids.push({
      userName: `User ${i+1}`,
      userImage: `/images/default-avatar.png`,
      songTitle: `Song Title ${i+1}`,
      amount: Math.random() * 50 + 5,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
    });
  }
  
  return bids;
}

// Add this function before the fetchAdminData function in the AdminDashboard component
const generateUserGrowthData = (timeRange) => {
  const data = [];
  const labels = [];
  let days = 7;
  let format = 'MMM D';
  
  if (timeRange === 'month') {
    days = 30;
  } else if (timeRange === 'year') {
    days = 12;
    format = 'MMM';
  }
  
  // Generate labels (days or months)
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    
    if (timeRange === 'year') {
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    } else {
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Generate random growth data with an upward trend
    const baseValue = 10 + Math.floor(i * (100 / days));
    const randomVariation = Math.floor(Math.random() * 10) - 3; // -3 to +6 range
    data.push(Math.max(0, baseValue + randomVariation));
  }
  
  return {
    labels,
    data
  };
};