import { motion } from "framer-motion";
import { BarChart2, TrendingUp, PieChart, Calendar, Filter, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export function BiddingAnalytics({ stats, isLoading }) {
  const [timeRange, setTimeRange] = useState("month");

  // Calculate success rate and other metrics
  const successRate = ((stats.wonBids / stats.totalBids) * 100) || 0;
  const averageBidAmount = stats.totalSpent / stats.totalBids || 0;
  
  const analyticsStats = [
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      change: "+5%",
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Average Bid",
      value: `$${averageBidAmount.toFixed(2)}`,
      change: "+12%",
      icon: <BarChart2 className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/20"
    }
  ];

  // Calculate bid distribution by status
  const bidDistribution = {
    COMPLETED: stats.wonBids,
    PENDING: stats.activeBids?.filter(bid => bid.status === 'PENDING').length || 0,
    REJECTED: stats.pastBids?.filter(bid => bid.status === 'REJECTED').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Bidding Analytics
          </h1>
          <p className="text-gray-400">Track your bidding performance and patterns</p>
        </div>
        
        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyticsStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border border-gray-800 bg-gradient-to-br ${stat.color}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <div className="flex items-center mt-2 text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {stat.change} vs last period
                </div>
              </div>
              <div className="p-3 bg-gray-900/30 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
        >
          <h3 className="font-semibold mb-4">Bid History</h3>
          <div className="h-64 flex items-end justify-between">
            {/* Placeholder for actual chart implementation */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-8 bg-blue-500/20 rounded-t-sm"
                   style={{ height: `${Math.random() * 100}%` }}>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popular DJs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
        >
          <h3 className="font-semibold mb-4">Top DJs by Success Rate</h3>
          <div className="space-y-4">
            {stats.pastBids
              .reduce((acc, bid) => {
                const dj = acc.find(d => d.name === bid.djName);
                if (dj) {
                  dj.total++;
                  if (bid.status === 'COMPLETED') dj.won++;
                } else {
                  acc.push({
                    name: bid.djName,
                    total: 1,
                    won: bid.status === 'COMPLETED' ? 1 : 0
                  });
                }
                return acc;
              }, [])
              .sort((a, b) => (b.won / b.total) - (a.won / a.total))
              .slice(0, 5)
              .map((dj, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{dj.name}</p>
                    <p className="text-sm text-gray-400">{dj.won} won of {dj.total} requests</p>
                  </div>
                  <span className="text-green-400">{((dj.won / dj.total) * 100).toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 