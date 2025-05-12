import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Ban, Star, Filter, DollarSign, Music } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function FanManagementPanel({ defaultCurrency = { code: 'USD', symbol: '$' } }) {
  const { data: session } = useSession();
  const [fans, setFans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, vip, blocked, tipped, requested
  const [stats, setStats] = useState({
    totalFans: 0,
    vipFans: 0,
    activeToday: 0,
    tippedFans: 0,
    totalTipsReceived: 0,
    totalRequests: 0,
    requestingFans: 0,
    totalRequestRevenue: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("lastActive"); // lastActive, totalSpent, totalRequests, totalTips
  const [topFans, setTopFans] = useState([]);

  // Memoize fetchFans with useCallback to maintain a stable reference
  const fetchFans = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/fans?filter=${filter}&sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch fans');
      const data = await response.json();
      setFans(data.fans);
      setStats(data.stats);
      setTopFans(data.topFans || []);
    } catch (error) {
      console.error('Error fetching fans:', error);
      toast.error('Failed to load fan data');
      setTopFans([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filter, sortBy]); // Include all dependencies used in the function

  useEffect(() => {
    fetchFans();
  }, [fetchFans]); // Use the memoized function as the dependency

  const handleStatusChange = async (fanId, newStatus) => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/fans/${fanId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update fan status');
      toast.success('Fan status updated successfully');
      fetchFans();
    } catch (error) {
      console.error('Error updating fan status:', error);
      toast.error('Failed to update fan status');
    }
  };

  const filteredFans = fans.filter(fan => 
    fan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fan.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return `${defaultCurrency.symbol}${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Total Fans",
      value: stats.totalFans,
      icon: Users,
      trend: "+12%",
      color: "text-blue-400"
    },
    {
      title: "VIP Fans",
      value: stats.vipFans,
      icon: Star,
      trend: "+5%",
      color: "text-yellow-400"
    },
    {
      title: "Song Requests",
      value: stats.totalRequests || 0,
      icon: Music,
      trend: "+18%",
      color: "text-purple-400"
    },
    {
      title: "Request Revenue",
      value: formatCurrency(stats.totalRequestRevenue || 0),
      icon: DollarSign,
      trend: "+24%",
      color: "text-green-400"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 md:p-6 space-y-4 md:space-y-6"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Fan Management</h2>
        
        {/* Mobile: Search and filter buttons */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search fans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg"
          >
            <Filter className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Mobile: Filter dropdown */}
        {showFilters && (
          <div className="md:hidden w-full bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm flex justify-center ${
                  filter === "all" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                All Fans
              </button>
              <button
                onClick={() => setFilter("vip")}
                className={`px-3 py-2 rounded-lg text-sm flex justify-center ${
                  filter === "vip" 
                    ? "bg-yellow-600/80 text-white" 
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                VIP Fans
              </button>
              <button
                onClick={() => setFilter("requested")}
                className={`px-3 py-2 rounded-lg text-sm flex justify-center ${
                  filter === "requested" 
                    ? "bg-purple-600/80 text-white" 
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                Requested
              </button>
              <button
                onClick={() => setFilter("tipped")}
                className={`px-3 py-2 rounded-lg text-sm flex justify-center ${
                  filter === "tipped" 
                    ? "bg-green-600/80 text-white" 
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                Tipped
              </button>
              <button
                onClick={() => setFilter("blocked")}
                className={`px-3 py-2 rounded-lg text-sm flex justify-center col-span-2 ${
                  filter === "blocked" 
                    ? "bg-red-600/80 text-white" 
                    : "bg-gray-700/50 text-gray-300"
                }`}
              >
                Blocked
              </button>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-1">Sort by</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="lastActive">Last Active</option>
                <option value="totalSpent">Total Spent</option>
                <option value="totalRequests">Request Count</option>
                <option value="totalTips">Tips Amount</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Desktop: Search and filters */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search fans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("vip")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "vip" 
                  ? "bg-yellow-600/80 text-white" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => setFilter("requested")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "requested" 
                  ? "bg-purple-600/80 text-white" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Requested
            </button>
            <button
              onClick={() => setFilter("tipped")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "tipped" 
                  ? "bg-green-600/80 text-white" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Tipped
            </button>
            <button
              onClick={() => setFilter("blocked")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "blocked" 
                  ? "bg-red-600/80 text-white" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Blocked
            </button>
            
            <div className="h-6 border-r border-gray-700 mx-1"></div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="lastActive">Sort by: Last Active</option>
              <option value="totalSpent">Sort by: Total Spent</option>
              <option value="totalRequests">Sort by: Request Count</option>
              <option value="totalTips">Sort by: Tips Amount</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            className={stat.color}
          />
        ))}
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-700 rounded w-1/6"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        {!isLoading && filteredFans.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Fan</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Requests</th>
                <th className="text-left p-4 text-gray-400 font-medium">Total Spent</th>
                <th className="text-left p-4 text-gray-400 font-medium">Tips Given</th>
                <th className="text-left p-4 text-gray-400 font-medium">Last Active</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFans.map(fan => (
                <tr key={fan._id || fan.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-medium">
                          {fan.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{fan.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{fan.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fan.status === 'vip' ? 'bg-yellow-500/20 text-yellow-400' :
                      fan.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {fan.status?.toUpperCase() || 'REGULAR'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{fan.totalRequests || 0}</td>
                  <td className="p-4 text-gray-300">${(fan.totalSpent || 0).toFixed(2)}</td>
                  <td className="p-4 text-gray-300">${(fan.totalTips || 0).toFixed(2)}</td>
                  <td className="p-4 text-gray-300">{formatDate(fan.lastActive)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStatusChange(fan._id || fan.id, fan.status === 'vip' ? 'regular' : 'vip')}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={fan.status === 'vip' ? 'Remove VIP Status' : 'Make VIP'}
                      >
                        <Star className={`h-4 w-4 ${fan.status === 'vip' ? 'text-yellow-400' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(fan._id || fan.id, fan.status === 'blocked' ? 'regular' : 'blocked')}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={fan.status === 'blocked' ? 'Unblock' : 'Block'}
                      >
                        <Ban className={`h-4 w-4 ${fan.status === 'blocked' ? 'text-red-400' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Mobile card view */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {!isLoading && filteredFans.length > 0 && filteredFans.map(fan => (
          <div 
            key={fan._id || fan.id} 
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-medium">
                    {fan.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{fan.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{fan.email || 'No email'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                fan.status === 'vip' ? 'bg-yellow-500/20 text-yellow-400' :
                fan.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {fan.status?.toUpperCase() || 'REGULAR'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-gray-400">Requests</p>
                <p className="text-gray-300 font-medium">{fan.totalRequests || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Spent</p>
                <p className="text-gray-300 font-medium">${(fan.totalSpent || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Tips Given</p>
                <p className="text-gray-300 font-medium">${(fan.totalTips || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Active</p>
                <p className="text-gray-300 font-medium">{formatDate(fan.lastActive)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 border-t border-gray-700/50 pt-3">
              <button
                onClick={() => handleStatusChange(fan._id || fan.id, fan.status === 'vip' ? 'regular' : 'vip')}
                className="px-3 py-1.5 rounded-lg bg-gray-700/50 flex items-center space-x-1"
              >
                <Star className={`h-4 w-4 ${fan.status === 'vip' ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className="text-xs">{fan.status === 'vip' ? 'Remove VIP' : 'Make VIP'}</span>
              </button>
              <button
                onClick={() => handleStatusChange(fan._id || fan.id, fan.status === 'blocked' ? 'regular' : 'blocked')}
                className="px-3 py-1.5 rounded-lg bg-gray-700/50 flex items-center space-x-1"
              >
                <Ban className={`h-4 w-4 ${fan.status === 'blocked' ? 'text-red-400' : 'text-gray-400'}`} />
                <span className="text-xs">{fan.status === 'blocked' ? 'Unblock' : 'Block'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Top Fans Section - Only show if we have data and not loading */}
      {!isLoading && topFans && topFans.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Fans by Accepted Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFans.map((fan) => (
              <div 
                key={fan._id || fan.id}
                className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-medium">
                    {fan.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{fan.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">
                    {fan.acceptedRequests || 0} accepted • {formatCurrency(fan.totalSpent || 0)} spent
                  </p>
                </div>
                {fan.status === 'vip' && (
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No results */}
      {!isLoading && filteredFans.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No fans found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {filter !== "all" 
              ? `No fans match the current "${filter}" filter. Try changing your filter options.` 
              : "You don't have any fans yet. As users interact with your music, they'll appear here."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, className = "" }) {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700/50`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h4 className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-white">{value}</h4>
        </div>
        <div className={`p-2 md:p-3 bg-gray-700/50 rounded-lg ${className}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
      <div className="mt-3 md:mt-4 flex items-center text-xs text-gray-400">
        <span className="text-green-500 font-medium">{trend}</span>
        <span className="ml-1">vs last month</span>
      </div>
    </div>
  );
} 