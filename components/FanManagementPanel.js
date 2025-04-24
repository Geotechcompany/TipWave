import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Ban, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function FanManagementPanel() {
  const { data: session } = useSession();
  const [fans, setFans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, vip, blocked
  const [stats, setStats] = useState({
    totalFans: 0,
    vipFans: 0,
    activeToday: 0
  });

  // Memoize fetchFans with useCallback to maintain a stable reference
  const fetchFans = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/fans?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch fans');
      const data = await response.json();
      setFans(data.fans);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching fans:', error);
      toast.error('Failed to load fan data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filter]); // Include all dependencies used in the function

  useEffect(() => {
    fetchFans();
  }, [fetchFans]); // Use the memoized function as the dependency

  const handleStatusChange = async (fanId, newStatus) => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/fans/${fanId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update fan status');
      toast.success('Fan status updated successfully');
      fetchFans();
    } catch (error) {
      console.error('Error updating fan status:', error);
      toast.error('Failed to update fan status');
    }
  };

  const filteredFans = fans.filter(fan => 
    fan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fan.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Fan Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300"
          >
            <option value="all">All Fans</option>
            <option value="vip">VIP Fans</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Fans"
          value={stats.totalFans}
          icon={Users}
          trend={"+12%"}
        />
        <StatsCard
          title="VIP Fans"
          value={stats.vipFans}
          icon={Star}
          trend={"+5%"}
        />
        <StatsCard
          title="Active Today"
          value={stats.activeToday}
          icon={Users}
          trend={"+8%"}
        />
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Fan</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Total Requests</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Total Spent</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Last Active</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredFans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No fans found
                  </td>
                </tr>
              ) : (
                filteredFans.map((fan) => (
                  <FanRow
                    key={fan.id}
                    fan={fan}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h4 className="text-2xl font-bold mt-2 text-white">{value}</h4>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-gray-400">
        <span className="text-green-500 font-medium">{trend}</span>
        <span className="ml-1">vs last month</span>
      </div>
    </div>
  );
}

function FanRow({ fan, onStatusChange }) {
  return (
    <tr className="hover:bg-gray-700/20">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-blue-400 font-medium">
              {fan.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{fan.name}</p>
            <p className="text-sm text-gray-400">{fan.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          fan.status === 'vip' ? 'bg-yellow-500/20 text-yellow-400' :
          fan.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {fan.status.toUpperCase()}
        </span>
      </td>
      <td className="p-4 text-gray-300">{fan.totalRequests}</td>
      <td className="p-4 text-gray-300">${fan.totalSpent.toFixed(2)}</td>
      <td className="p-4 text-gray-300">{new Date(fan.lastActive).toLocaleDateString()}</td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onStatusChange(fan.id, fan.status === 'vip' ? 'regular' : 'vip')}
            className="p-1 hover:bg-gray-700 rounded"
            title={fan.status === 'vip' ? 'Remove VIP Status' : 'Make VIP'}
          >
            <Star className={`h-4 w-4 ${fan.status === 'vip' ? 'text-yellow-400' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => onStatusChange(fan.id, fan.status === 'blocked' ? 'regular' : 'blocked')}
            className="p-1 hover:bg-gray-700 rounded"
            title={fan.status === 'blocked' ? 'Unblock' : 'Block'}
          >
            <Ban className={`h-4 w-4 ${fan.status === 'blocked' ? 'text-red-400' : 'text-gray-400'}`} />
          </button>
        </div>
      </td>
    </tr>
  );
} 