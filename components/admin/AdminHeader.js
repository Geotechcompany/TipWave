import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, RefreshCw, Search, Settings, 
  LogOut, User, ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function AdminHeader({ 
  user,
  signOut,
  refreshData,
  refreshing,
  showNotifications,
  setShowNotifications,
  notificationsRef,
  showProfileMenu,
  setShowProfileMenu,
  profileMenuRef,
  stats,
  setActiveTab
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add scroll detection for subtle header appearance change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? "bg-gray-800/95 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-r from-gray-900 to-gray-800"
      } border-b border-gray-700/50`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white hidden md:block">
              Admin Dashboard
            </h1>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:flex items-center">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-gray-900/70 border-gray-700/50 focus:border-gray-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={refreshing}
              className="hover:bg-gray-700/70"
            >
              <RefreshCw className={`h-5 w-5 text-gray-300 ${
                refreshing ? "animate-spin" : ""
              }`} />
            </Button>

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="hover:bg-gray-700/70 relative"
              >
                <Bell className="h-5 w-5 text-gray-300" />
                {stats.notifications?.length > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-gray-800 animate-pulse" />
                )}
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/80 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-700/50 flex justify-between items-center">
                      <h3 className="font-medium text-sm text-gray-200">Notifications</h3>
                      {stats.notifications?.length > 0 && (
                        <span className="text-xs py-0.5 px-2 bg-blue-500/20 text-blue-400 rounded-full">
                          {stats.notifications.length} new
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                      {stats.notifications?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <Bell className="h-8 w-8 text-gray-600 mb-2" />
                          <p className="text-sm text-gray-400 text-center">
                            No new notifications
                          </p>
                        </div>
                      ) : (
                        stats.notifications?.map((notification, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-4 py-3 hover:bg-gray-700/40 cursor-pointer border-b border-gray-700/30 last:border-b-0"
                          >
                            <p className="text-sm text-gray-200">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                              {new Date(notification.time).toLocaleString()}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {stats.notifications?.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-700/50">
                        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors w-full text-center">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div ref={profileMenuRef} className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-gray-700/70 px-2"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-300" />
                )}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/80 py-1"
                  >
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <p className="text-sm font-medium text-white">{user?.fullName || "Admin User"}</p>
                      <p className="text-xs text-gray-400">{user?.email || "admin@example.com"}</p>
                    </div>
                    
                    <div className="py-1">
                      <motion.button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveTab("settings");
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700/50 flex items-center text-gray-200"
                        whileHover={{ x: 2 }}
                      >
                        <Settings className="h-4 w-4 mr-2 text-gray-400" />
                        Settings
                      </motion.button>
                      
                      <motion.button
                        onClick={() => signOut()}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700/50 flex items-center text-red-400"
                        whileHover={{ x: 2 }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 