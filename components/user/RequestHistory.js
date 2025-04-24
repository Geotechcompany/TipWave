import { motion } from "framer-motion";
import { Music, History } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function RequestHistory({ requests, isLoading }) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredRequests = requests
    .filter(request => filterStatus === "ALL" || request.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Request History
          </h1>
          <p className="text-gray-400">View your past song requests</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left p-4 text-gray-400 font-medium">Song</th>
                  <th className="text-left p-4 text-gray-400 font-medium">DJ</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Event</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700/50">
                          {request.albumArt ? (
                            <Image
                              src={request.albumArt}
                              alt={request.songTitle}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{request.songTitle}</p>
                          <p className="text-sm text-gray-400">{request.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{request.djName}</td>
                    <td className="p-4 text-gray-300">{request.eventName || "—"}</td>
                    <td className="p-4">${request.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${request.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                          request.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                        {request.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No request history</h3>
            <p className="text-gray-400 text-sm">Your past song requests will appear here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 