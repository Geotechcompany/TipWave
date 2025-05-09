import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Music, Loader2 } from "lucide-react";
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
      
      // Make sure all properties exist with proper defaults
      setAnalytics({
        requestTrends: data.requestTrends || [],
        popularSongs: data.popularSongs || [],
        audienceStats: {
          totalRequests: data.audienceStats?.totalRequests || 0,
          totalRevenue: data.audienceStats?.totalRevenue || 0, 
          totalUsers: data.audienceStats?.totalUsers || 0,
          averageBid: data.audienceStats?.averageBid || 0,
          requestsPerDay: data.audienceStats?.requestsPerDay || 0,
          uniqueRequesters: data.audienceStats?.uniqueRequesters || 0,
          avgRequestValue: data.audienceStats?.avgRequestValue || 0
        },
        revenueData: data.revenueData || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, timeframe]); // Add dependencies used in the function

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]); // Use the memoized function as dependency

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Requests"
              value={analytics.audienceStats?.totalRequests || 0}
              icon={Music}
            />
            <StatCard
              title="Unique Requesters"
              value={analytics.audienceStats?.uniqueRequesters || 0}
              icon={Users}
            />
            <StatCard
              title="Average Request Value"
              value={formatCurrency(analytics.audienceStats?.avgRequestValue || 0)}
              icon={TrendingUp}
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-lg font-medium mb-4">Revenue Trends</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Songs */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-medium">Most Requested Songs</h3>
            </div>
            <div className="divide-y divide-gray-700/50">
              {analytics.popularSongs?.map((song, index) => (
                <SongRow
                  key={song._id || index}
                  rank={index + 1}
                  title={song.title}
                  artist={song.artist}
                  requestCount={song.requestCount}
                  currencySymbol={defaultCurrency.symbol}
                />
              )) || (
                <div className="text-center py-6 text-gray-400">
                  No song data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h4 className="text-2xl font-bold mt-2 text-white">{value}</h4>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
    </div>
  );
}

function SongRow({ rank, title, artist, requestCount, currencySymbol = '$' }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-700/20">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
          {rank}
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-gray-400">{requestCount} requests</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-green-400">{currencySymbol}{artist.totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  );
} 