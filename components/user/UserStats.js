"use client";

import { motion } from "framer-motion";
import { Music, UserCheck, DollarSign, Clock, TrendingUp, Users } from "lucide-react";

export function UserStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: <DollarSign className="h-6 w-6 text-amber-500" />,
      label: "Total Spent",
      value: `$${stats?.totalSpent?.toFixed(2) || '0.00'}`,
      bgColor: "from-amber-950/30 to-amber-900/20"
    },
    {
      icon: <Music className="h-6 w-6 text-blue-500" />,
      label: "Songs Requested",
      value: stats?.songsRequested || 0,
      bgColor: "from-blue-950/30 to-blue-900/20"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      label: "Favorite DJs",
      value: stats?.favoriteDJs || 0,
      bgColor: "from-purple-950/30 to-purple-900/20"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      label: "Tips This Month",
      value: `$${stats?.tipsThisMonth?.toFixed(2) || '0.00'}`,
      bgColor: "from-green-950/30 to-green-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 shadow-lg`}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800/40 rounded-full p-3">
              {item.icon}
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium">{item.label}</h3>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 