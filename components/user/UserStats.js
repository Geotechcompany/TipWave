import { motion } from "framer-motion";
import { ChevronDown, DollarSign, Music, CheckCircle, Clock } from "lucide-react";

export default function UserStats({ stats, isLoading, timeRange, setTimeRange }) {
  const statCards = [
    {
      title: "Total Bids",
      value: stats.totalBids,
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-blue-500/20 text-blue-500",
      change: "+12%"
    },
    {
      title: "Won Bids",
      value: stats.wonBids,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-green-500/20 text-green-500",
      change: "+8%"
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-purple-500/20 text-purple-500",
      change: "+15%"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="relative mt-2 sm:mt-0">
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
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-pulse h-32">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2 mt-4"></div>
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, change, index }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center text-xs text-gray-400">
        <svg className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-green-500 font-medium">{change}</span>
        <span className="ml-1">vs last period</span>
      </div>
    </motion.div>
  );
} 