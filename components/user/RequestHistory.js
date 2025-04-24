"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Music, Check, X, Clock } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

// Fetch function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export function RequestHistory({ initialRequests = [] }) {
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState("all");
  
  // Use SWR for auto-refreshing data
  const { data, error, isLoading } = useSWR('/api/user/requests', fetcher, {
    fallbackData: initialRequests,
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // Filter requests based on status
  const filteredRequests = data?.filter(request => {
    if (filter === "all") return true;
    return request.status.toLowerCase() === filter;
  }) || [];

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
        Error loading requests: {error.message || "Failed to load request history"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <FilterButton 
          label="All" 
          active={filter === "all"} 
          onClick={() => setFilter("all")} 
        />
        <FilterButton 
          label="Pending" 
          active={filter === "pending"} 
          onClick={() => setFilter("pending")} 
        />
        <FilterButton 
          label="Approved" 
          active={filter === "approved"} 
          onClick={() => setFilter("approved")} 
        />
        <FilterButton 
          label="Rejected" 
          active={filter === "rejected"} 
          onClick={() => setFilter("rejected")} 
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <RequestItem 
              key={request.id || index} 
              request={request} 
              index={index} 
              formatCurrency={formatCurrency} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function RequestItem({ request, index, formatCurrency }) {
  // Format the date
  const formattedDate = request.date 
    ? formatDistanceToNow(new Date(request.date), { addSuffix: true })
    : "Recently";

  // Determine status icon and color
  let statusIcon;
  let statusColor;
  
  switch (request.status.toLowerCase()) {
    case 'approved':
      statusIcon = <Check className="h-4 w-4" />;
      statusColor = "bg-green-500 text-white";
      break;
    case 'rejected':
      statusIcon = <X className="h-4 w-4" />;
      statusColor = "bg-red-500 text-white";
      break;
    default:
      statusIcon = <Clock className="h-4 w-4" />;
      statusColor = "bg-yellow-500 text-white";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-gray-800/30 to-gray-900/20 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 shadow-md"
    >
      <div className="flex items-center">
        <div className="bg-gray-800/40 rounded-full p-2 mr-4">
          <Music className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">{request.songTitle}</h3>
          <p className="text-sm text-gray-400">{request.artist}</p>
        </div>
        <div className="text-right">
          <div className="font-medium text-white">{formatCurrency(request.amount)}</div>
          <div className="flex items-center justify-end mt-1">
            <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
              {statusIcon}
              <span>{request.status}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-right">{formattedDate}</div>
    </motion.div>
  );
} 