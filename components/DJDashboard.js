import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Music, DollarSign, Users, Clock, Search, LayoutDashboard, ChevronDown, Bell, Settings } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Link from "next/link";
import { useRouter } from "next/router";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DEFAULT_ALBUM_ART = '/images/default-album-art.jpg';

export default function DJDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    earnings: 0,
    topSongs: [],
    frequentUsers: [],
    totalRequests: 0,
    totalPlayed: 0,
  });

  useEffect(() => {
    const fetchDJData = async () => {
      setIsLoading(true);
      try {
        // Fetch queue and stats in parallel - using the correct API endpoints
        const [queueResponse, statsResponse] = await Promise.all([
          fetch("/api/songs/queue"),
          fetch("/api/user/stats")
        ]);
        
        if (!queueResponse.ok) throw new Error("Failed to fetch queue");
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        
        const queueData = await queueResponse.json();
        const statsData = await statsResponse.json();
        
        setQueue(queueData);
        
        // Extract user information from active bids for top users
        const userMap = new Map();
        
        // Process each bid to collect user data
        statsData.activeBids.forEach(bid => {
          const userId = bid.clerkId || 'anonymous';
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              id: userId,
              name: bid.userDisplayName || 'Anonymous',
              email: '',
              profileImage: '/images/default-avatar.png',
              totalSpent: 0,
              requestCount: 0,
              lastRequest: null
            });
          }
          
          const userData = userMap.get(userId);
          userData.totalSpent += bid.amount || 0;
          userData.requestCount += 1;
          
          // Update last request if this bid is more recent
          const bidDate = new Date(bid.createdAt);
          if (!userData.lastRequest || bidDate > new Date(userData.lastRequest)) {
            userData.lastRequest = bid.createdAt;
          }
        });
        
        // Process queue data to enrich user information
        queueData.forEach(item => {
          const userId = item.clerkId || 'anonymous';
          if (userMap.has(userId)) {
            const userData = userMap.get(userId);
            if (item.userDisplayName) userData.name = item.userDisplayName;
            
            // Track additional spending from queue items
            userData.totalSpent += item.bidAmount || 0;
            userData.requestCount += 1;
            
            // Update last request if this queue item is more recent
            const itemDate = new Date(item.createdAt);
            if (!userData.lastRequest || itemDate > new Date(userData.lastRequest)) {
              userData.lastRequest = item.createdAt;
            }
          }
        });
        
        // Convert to array and sort by totalSpent (descending)
        const frequentUsers = Array.from(userMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10); // Limit to top 10 users
        
        // Map the user stats to DJ stats format
        setStats({
          earnings: statsData.totalSpent || 0,
          topSongs: statsData.activeBids || [],
          frequentUsers: frequentUsers,
          totalRequests: statsData.totalBids || 0,
          totalPlayed: statsData.wonBids || 0,
        });
      } catch (error) {
        console.error("Error fetching DJ data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isSignedIn) {
      fetchDJData();
    }
  }, [isSignedIn]);

  const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need to be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  const profileImageUrl = user?.imageUrl || "/images/default-avatar.png";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "dj@example.com";

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      tab: "dashboard",
    },
    { icon: <Music size={20} />, label: "Song Queue", tab: "queue" },
    { icon: <DollarSign size={20} />, label: "Earnings", tab: "earnings" },
    { icon: <Users size={20} />, label: "Top Users", tab: "users" },
  ];

  // Chart data for DJ earnings
  const earningsChartData = {
    labels: queue.slice(0, 5).map(item => item.title?.substring(0, 10) + "..."),
    datasets: [
      {
        label: 'Bid Amount',
        data: queue.slice(0, 5).map(item => item.bidAmount || 0),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const renderDashboardContent = () => {
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Requests</p>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-indigo-600 mr-2" />
              <h3 className="text-3xl font-bold">{stats.totalRequests || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Songs Played</p>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600 mr-2" />
              <h3 className="text-3xl font-bold">{stats.totalPlayed || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-2" />
              <h3 className="text-3xl font-bold">${stats.earnings?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Bids Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
            <div style={{ height: '300px' }}>
              <Line 
                data={earningsChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Bid Amount ($)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Song Queue */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Song Queue</h2>
            {queue.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No songs in queue</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-[300px]">
                {queue.slice(0, 5).map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 mr-3">
                      <Image
                        src={song.albumArt || DEFAULT_ALBUM_ART}
                        alt={song.title}
                        fill
                        className="object-cover rounded-md"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {song.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                    </div>
                    <div className="text-green-600 font-medium">
                      ${song.bidAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Songs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Requested Songs</h2>
            {stats.topSongs && stats.topSongs.length > 0 ? (
              <div className="space-y-3">
                {stats.topSongs.map((song, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-full mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-gray-500">{song.artist}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                      {song.count} requests
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No song requests yet</p>
              </div>
            )}
          </div>

          {/* Frequent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Spending Users</h2>
            {stats.frequentUsers && stats.frequentUsers.length > 0 ? (
              <div className="space-y-3">
                {stats.frequentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <span className="text-green-600 font-medium">${user.spent?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Add this renderTopUsersContent function to handle the users tab
  const renderTopUsersContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Top Users</h2>
          
          {stats.frequentUsers && stats.frequentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Song Requests
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Request
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.frequentUsers.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={user.profileImage || DEFAULT_ALBUM_ART}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || "Anonymous"}</div>
                            <div className="text-sm text-gray-500">{user.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${user.totalSpent?.toFixed(2) || "0.00"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.requestCount || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.lastRequest ? new Date(user.lastRequest).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found. As users place bids, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update the renderContent function to use the new renderTopUsersContent
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "queue":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Song Queue</h2>
            {queue.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No songs in queue</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queue.map((song) => (
                      <tr key={song._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <Image
                                src={song.albumArt || DEFAULT_ALBUM_ART}
                                alt={song.title}
                                fill
                                className="object-cover rounded-md"
                                sizes="40px"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{song.title}</div>
                              <div className="text-sm text-gray-500">{song.artist}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.userDisplayName || "Anonymous"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">${song.bidAmount?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${song.status === 'PLAYING' ? 'bg-green-100 text-green-800' : 
                            song.status === 'NEXT' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                            {song.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(song.duration_ms)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "earnings":
        return renderEarningsContent();
      case "users":
        return renderTopUsersContent();
      default:
        return renderDashboardContent();
    }
  };

  // Replace signOut with router.push to sign-out page
  const handleSignOut = () => {
    router.push('/api/auth/signout');
  };

  // Add this new function to render the earnings content
  const renderEarningsContent = () => {
    // Create sample data for earnings over time if not available yet
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      return months[monthIndex];
    });
    
    // Sample earnings data (replace with real data when available)
    const earningsData = {
      labels: lastSixMonths,
      datasets: [
        {
          label: 'Monthly Earnings',
          data: [120, 190, 230, 275, 310, stats.earnings || 350],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.2,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }
      ]
    };

    const earningsOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Monthly Earnings'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount ($)'
          }
        }
      }
    };

    // Create sample data for top earning songs
    const topEarningSongs = stats.topSongs.slice(0, 5).map(song => ({
      ...song,
      earnings: song.bidAmount || Math.floor(Math.random() * 100) + 10
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-2" />
              <h3 className="text-3xl font-bold">${stats.earnings.toFixed(2)}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Average Per Song</p>
            <div className="flex items-center">
              <Music className="h-8 w-8 text-indigo-600 mr-2" />
              <h3 className="text-3xl font-bold">
                ${stats.totalRequests > 0 ? (stats.earnings / stats.totalRequests).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Pending Earnings</p>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600 mr-2" />
              <h3 className="text-3xl font-bold">${(stats.earnings * 0.2).toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Earnings Trend</h2>
          <div className="h-64">
            <Line data={earningsData} options={earningsOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Earning Songs</h2>
          {topEarningSongs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Song
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requester
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topEarningSongs.map((song, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={song.albumArt || DEFAULT_ALBUM_ART}
                              alt={song.title}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{song.title}</div>
                            <div className="text-sm text-gray-500">{song.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {song.userDisplayName || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">${song.earnings.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${song.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          song.status === 'PLAYING' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {song.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No earning data available yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Tip Wave" 
              width={100} 
              height={30} 
              className="mr-8"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-400">
              <Search size={20} />
            </button>
            <button className="text-gray-400">
              <Bell size={20} />
            </button>
            <button className="text-gray-400">
              <Settings size={20} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2"
              >
                <Image
                  src={profileImageUrl}
                  alt={user?.fullName || "DJ"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md hidden md:flex flex-col">
          <nav className="flex-1 mt-5 px-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`${
                    activeTab === item.tab
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* DJ Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Image
                  src={profileImageUrl}
                  alt={user?.fullName || "DJ"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <span className="absolute top-0 right-0 bg-green-400 text-xs text-white px-2 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {user?.fullName || "DJ Name"}
              </h3>
              <p className="text-xs text-gray-500">{userEmail}</p>
              <button className="mt-3 w-full bg-gray-900 text-white rounded-md py-2 text-sm hover:bg-gray-700 transition-colors">
                DJ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold mb-8">
            Hi, Welcome back {user?.firstName}! 👋
          </h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : renderContent()}
        </div>
      </div>
    </div>
  );
}
