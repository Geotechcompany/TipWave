import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState("week");

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Revenue Trends</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Component Coming Soon
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">User Growth</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Component Coming Soon
          </div>
        </div>

        {/* Popular Times */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Popular Request Times</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Component Coming Soon
          </div>
        </div>

        {/* Bid Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Bid Distribution</h3>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Component Coming Soon
          </div>
        </div>
      </div>
    </motion.div>
  );
} 