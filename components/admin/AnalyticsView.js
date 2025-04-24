import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from "react-hot-toast";
import axios from "axios";

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState("week");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard summary metrics
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalBids: 0,
    avgBidAmount: 0
  });

  // Use useCallback to memoize the fetchAnalyticsData function
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
      setAnalyticsData(response.data);
      
      // Calculate summary metrics
      const revenue = response.data.revenue || [];
      const users = response.data.users || [];
      const bids = response.data.bids || [];
      // This is used in the PieChart - keep it
      const bidsByStatus = response.data.bidsByStatus || [];
      
      const totalRevenue = revenue.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalUsers = users.length > 0 ? users[users.length - 1].cumulative : 0;
      const totalBids = bids.reduce((sum, item) => sum + (item.count || 0), 0);
      const allBidAmounts = bids.flatMap(day => Array(day.count).fill(day.avgAmount || 0));
      const avgBidAmount = allBidAmounts.length ? 
        allBidAmounts.reduce((sum, amount) => sum + amount, 0) / allBidAmounts.length : 0;
      
      setSummary({
        totalRevenue,
        totalUsers,
        totalBids,
        avgBidAmount
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError("Failed to load analytics data");
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]); // Add timeRange as a dependency

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]); // Include fetchAnalyticsData in the dependency array

  // Color constants for charts
  const COLORS = {
    revenue: '#3B82F6', // blue
    users: '#8B5CF6',   // purple
    bids: '#EC4899',    // pink
    pending: '#F59E0B',  // amber
    approved: '#10B981', // emerald
    rejected: '#EF4444', // red
    completed: '#6366F1'  // indigo
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold">{summary.totalUsers}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Bids</p>
              <h3 className="text-2xl font-bold">{summary.totalBids}</h3>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-full">
              <Activity className="h-6 w-6 text-pink-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Bid Amount</p>
              <h3 className="text-2xl font-bold">{formatCurrency(summary.avgBidAmount)}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Revenue Trends</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-400">
                <span>Failed to load revenue data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.revenue || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
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
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">User Growth</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-400">
                <span>Failed to load user data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.users || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value, name) => [value, name === 'count' ? 'New Users' : 'Total Users']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="New Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#A78BFA"
                    fillOpacity={0}
                    name="Total Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bid Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Bid Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-400">
                <span>Failed to load bid data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.bids || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value, name) => [
                      name === 'avgAmount' ? `$${value}` : value, 
                      name === 'count' ? 'Bids' : 'Avg Amount'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#EC4899" name="Bids" />
                  <Bar dataKey="avgAmount" fill="#F59E0B" name="Avg Amount" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bid Status Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Bid Status Distribution</h3>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-400">
                <span>Failed to load bid status data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.bidsByStatus || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analyticsData?.bidsByStatus || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.status.toLowerCase()] || '#777777'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value, name, props) => [value, props.payload.status]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 