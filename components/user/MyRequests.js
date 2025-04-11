import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Clock, PlusCircle } from "lucide-react";
import Image from "next/image";
import { NewRequestModal } from "./NewRequestModal";

export function MyRequests({ requests, isLoading }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter to show only active requests (PENDING or ACCEPTED)
  const activeRequests = requests.filter(r => 
    r.status === "PENDING" || r.status === "ACCEPTED"
  );

  const handleNewRequest = (requestData) => {
    // TODO: Implement request submission logic
    console.log("New request:", requestData);
    // You would typically make an API call here
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Active Requests
          </h1>
          <p className="text-gray-400">Your current song requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewRequest}
      />

      {/* Active Requests Table */}
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
        ) : activeRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left p-4 text-gray-400 font-medium">Song</th>
                  <th className="text-left p-4 text-gray-400 font-medium">DJ</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {activeRequests.map((request) => (
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
                    <td className="p-4">${request.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${request.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300' : 
                          'bg-yellow-500/20 text-yellow-300'}`}>
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
            <Music className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No active requests</h3>
            <p className="text-gray-400 text-sm">Make a new request to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 