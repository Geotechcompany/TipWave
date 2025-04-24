import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Calendar, Loader2, Mail } from "lucide-react";
import axios from "axios";

export default function AdminUsersList({ initialUsers = null }) {
  // Simplified state management for preview
  const [users, setUsers] = useState(initialUsers || []);
  const [isLoading, setIsLoading] = useState(!initialUsers);
  const [error, setError] = useState(null);
  
  // Fetch only recent users on load
  useEffect(() => {
    if (!initialUsers) {
      fetchRecentUsers();
    }
  }, [initialUsers]);
  
  const fetchRecentUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Only get recent users (limited to 6)
      const response = await axios.get(`/api/admin/users?limit=6&sort=newest`);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load recent users");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle empty state
  if (!users || users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-200">Recent Users</h3>
          <span className="text-xs text-gray-400">No users found</span>
        </div>
        <div className="p-6 text-center text-gray-400">
          <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No recent users to display</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Recent Users</h3>
        <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="px-6 divide-y divide-gray-700">
          {users.map((user, i) => (
            <div key={user.id || i} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">{user.name?.[0] || '?'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-100">{user.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user.email || 'No email'}
                  </p>
                </div>
              </div>
              
              <Link 
                href={`/admin/users/${user.id || i}`} 
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
              >
                Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
} 