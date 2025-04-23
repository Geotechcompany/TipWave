import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, RefreshCw, Search, Settings, 
  LogOut, User, ChevronDown, Shield 
} from "lucide-react";
import Image from "next/image";

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
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
      <div className="flex items-center justify-between px-6 h-16">
        <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-900/50 rounded-lg px-3 py-1.5">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-sm ml-2 w-48"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${
              refreshing ? "animate-spin" : ""
            }`}
            disabled={refreshing}
          >
            <RefreshCw className="h-5 w-5 text-gray-300" />
          </button>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-300" />
              {stats.notifications?.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2"
              >
                {stats.notifications?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No new notifications
                  </p>
                ) : (
                  stats.notifications?.map((notification, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-gray-700/50 cursor-pointer"
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.time).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Profile Menu */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-gray-600">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user?.fullName || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium line-clamp-1">
                  {user?.fullName || "Admin User"}
                </p>
                <p className="text-xs text-gray-400 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2"
              >
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab("settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700/50 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700/50 flex items-center text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 