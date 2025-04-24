"use client";

import { motion } from "framer-motion";
import { Music, UserCheck, PlusCircle, History, Clock, DollarSign, Calendar } from "lucide-react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";

// Fetch function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export function ActivityTab({ initialActivities = [] }) {
  // Use SWR for auto-refreshing data
  const { data, error, isLoading } = useSWR('/api/user/activities', fetcher, {
    fallbackData: initialActivities,
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-400">
        Error loading activities: {error.message || "Failed to load user activities"}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6"
    >
      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((activity, index) => (
            <ActivityItem key={activity._id || index} activity={activity} index={index} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Recent Activity</h3>
          <p className="text-gray-500 max-w-sm">
            Your activity history will appear here once you start making requests or receiving recommendations.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function ActivityItem({ activity, index }) {
  // Format the date
  const formattedDate = activity.timestamp 
    ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
    : "Recently";

  // Determine icon based on activity type
  let icon;
  let bgColor;
  
  switch (activity.type) {
    case 'PLAYED':
      icon = <Music className="h-4 w-4 text-blue-400" />;
      bgColor = 'bg-blue-500/20';
      break;
    case 'REQUEST':
      icon = <PlusCircle className="h-4 w-4 text-green-400" />;
      bgColor = 'bg-green-500/20';
      break;
    case 'RECOMMENDATION':
      icon = <UserCheck className="h-4 w-4 text-purple-400" />;
      bgColor = 'bg-purple-500/20';
      break;
    case 'PAYMENT':
      icon = <DollarSign className="h-4 w-4 text-amber-400" />;
      bgColor = 'bg-amber-500/20';
      break;
    case 'EVENT':
      icon = <Calendar className="h-4 w-4 text-pink-400" />;
      bgColor = 'bg-pink-500/20';
      break;
    default:
      icon = <Clock className="h-4 w-4 text-gray-400" />;
      bgColor = 'bg-gray-500/20';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-3"
    >
      <div className={`p-2 ${bgColor} rounded-full`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{activity.title}</p>
        <p className="text-sm text-gray-400">{formattedDate}</p>
        {activity.description && (
          <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
        )}
      </div>
    </motion.div>
  );
} 