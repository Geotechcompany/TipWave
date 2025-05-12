import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Music} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AnalyticsPanel({ defaultCurrency = { code: 'USD', symbol: '$' } }) {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState({
    requestTrends: [],
    popularSongs: [],
    audienceStats: {
      totalRequests: 0,
      totalRevenue: 0,
      totalUsers: 0,
      averageBid: 0,
      requestsPerDay: 0,
      uniqueRequesters: 0,
      avgRequestValue: 0
    },
    revenueData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");

  // Format currency with the correct symbol
  const formatCurrency = (amount) => {
    return `${defaultCurrency.symbol || '$'}${parseFloat(amount).toFixed(2)}`;
  };

  // Memoize fetchAnalytics with useCallback
  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]); // Use the memoized function as dependency

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6"
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Header with Timeframe Selector */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Requests"
              value={analytics.audienceStats?.totalRequests || 0}
              icon={Music}
              trend="+12%"
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10"
              iconClass="text-purple-400"
            />
            <StatsCard
              title="Unique Requesters"
              value={analytics.audienceStats?.uniqueRequesters?.length || 0}
              icon={Users}
              trend="+5%"
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
              iconClass="text-blue-400"
            />
            <StatsCard
              title="Average Request Value"
              value={formatCurrency(analytics.audienceStats?.avgRequestValue || 0)}
              icon={TrendingUp}
              trend="+8%"
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10"
              iconClass="text-green-400"
            />
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
              <div className="text-sm text-gray-400">
                Total Revenue: {formatCurrency(analytics.audienceStats?.totalRevenue || 0)}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.requestTrends}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#4F46E5' }}
                    fill="url(#revenueGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Songs Section */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Most Requested Songs</h3>
            </div>
            <div className="divide-y divide-gray-700/50">
              {analytics.popularSongs.map((song, index) => (
                <SongRow
                  key={song.id}
                  rank={index + 1}
                  title={song.title}
                  artist={song.artist}
                  requestCount={song.requestCount}
                  revenue={song.totalRevenue}
                  currencySymbol={defaultCurrency.symbol}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Enhanced StatsCard component
function StatsCard({ title, value, icon: Icon, trend, className, iconClass }) {
  return (
    <div className={`rounded-xl p-4 md:p-6 border border-gray-700/50 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h4 className="text-2xl font-bold mt-2 text-white">{value}</h4>
        </div>
        <div className={`p-3 rounded-lg bg-gray-700/30 ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-green-400 font-medium">{trend}</span>
        <span className="ml-1.5 text-gray-400">vs last period</span>
      </div>
    </div>
  );
}

// Enhanced SongRow component
function SongRow({ rank, title, artist, requestCount, revenue, currencySymbol }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-700/20 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
          {rank}
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-gray-400">{artist} • {requestCount} requests</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-green-400">{currencySymbol}{revenue.toFixed(2)}</p>
      </div>
    </div>
  );
} 