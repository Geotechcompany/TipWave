import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar, Filter } from "lucide-react";
import { useState } from "react";

export function SpendingAnalytics({ stats, isLoading }) {
  const [timeRange, setTimeRange] = useState("month");
  const [category, setCategory] = useState("all");

  // Mock data for spending chart
  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [150, 220, 180, 290, 210, 320],
      }
    ]
  };

  const spendingStats = [
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      change: "+15%",
      icon: <DollarSign className="h-5 w-5 text-green-400" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Average Per Request",
      value: `$${(stats.totalSpent / (stats.totalBids || 1)).toFixed(2)}`,
      change: "+8%",
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Spending Analytics
          </h1>
          <p className="text-gray-400">Track your song request spending</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {spendingStats.map((stat, index) => (
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
                  <TrendingUp className="h-4 w-4 mr-1" />
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

      {/* Spending History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700/50">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Song</th>
                <th className="p-4 font-medium">DJ</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.pastBids.slice(0, 5).map((transaction, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-700/10">
                  <td className="p-4 text-gray-300">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.song.title}</p>
                      <p className="text-sm text-gray-400">{transaction.song.artist}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{transaction.djName}</td>
                  <td className="p-4 font-medium">${transaction.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        transaction.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'}`}>
                      {transaction.status.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 