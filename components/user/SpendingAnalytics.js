"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
// Removed useState since we're not using state variables in this component currently
// import { useState } from "react";

export function SpendingAnalytics({ stats = {}, isLoading = false }) {
  // Get currency context
  const { formatCurrency, currency, isLoading: isCurrencyLoading } = useCurrency();

  // Removed unused state variables
  // const [timeRange, setTimeRange] = useState("month");
  // const [category, setCategory] = useState("all");

  // Destructure stats with default values - remove activeBids since it's not used
  const {
    totalSpent = 0,
    totalBids = 0,
    pastBids = []
    // activeBids = []
  } = stats;

  // Removed unused spendingData variable
  // This was likely intended for a chart that hasn't been implemented yet

  const spendingStats = [
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      change: "+15%",
      icon: <DollarSign className="h-5 w-5 text-green-400" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Average Per Request",
      value: formatCurrency(totalSpent / (totalBids || 1)),
      change: "+8%",
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/20"
    }
  ];

  // Combined loading state
  const isLoadingData = isLoading || isCurrencyLoading;

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i}
              className="h-32 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50" />
        <div className="h-96 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {spendingStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-6 rounded-xl border border-gray-800/50
              bg-gradient-to-br ${stat.color}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="p-2 rounded-lg bg-gray-900/30">
                {stat.icon}
              </span>
            </div>
            <p className="text-sm text-gray-400">{stat.title}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className="text-sm text-green-400">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800/50">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/30">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Song</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">DJ</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {pastBids.slice(0, 5).map((transaction, index) => (
                <tr key={transaction.id || index} className="border-b border-gray-800/50 hover:bg-gray-700/10">
                  <td className="p-4 text-gray-300">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.song?.title || 'Unknown Song'}</p>
                      <p className="text-sm text-gray-400">{transaction.song?.artist || 'Unknown Artist'}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{transaction.djName || 'Unknown DJ'}</td>
                  <td className="p-4 font-medium">
                    {formatCurrency(transaction.amount || 0)}
                    {currency && currency.code !== 'USD' && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({currency.code})
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        transaction.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'}
                    `}>
                      {(transaction.status || 'pending').toLowerCase()}
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