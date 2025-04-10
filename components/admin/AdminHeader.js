import { useState } from "react";
import { Bell, RefreshCw, Search, Settings, CheckCircle, AlertCircle, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="border-b border-gray-800 fixed top-0 right-0 left-0 bg-gray-900 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">TP</span>
            </div>
            <span className="text-xl font-bold hidden md:block">
              <span className="text-white">Tip</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Wave</span>
              <span className="text-white ml-1">Admin</span>
            </span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-800 text-sm rounded-lg pl-9 pr-4 py-1.5 w-56 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className={`p-2 rounded-full hover:bg-gray-800 ${refreshing ? 'text-gray-500' : 'text-gray-400'}`}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-800 relative"
            >
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {stats.notifications.map((notification) => (
                    <div key={notification.id} className="mb-2 last:mb-0">
                      <div className="rounded-lg hover:bg-gray-700/50 p-2 transition-colors duration-150 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full flex-shrink-0 ${
                            notification.type === 'success' ? 'bg-green-500/20 text-green-500' :
                            notification.type === 'alert' ? 'bg-red-500/20 text-red-500' : 
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {notification.type === 'success' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : notification.type === 'alert' ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Info className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-700 text-center">
                  <button className="text-sm text-blue-400 hover:text-blue-300 w-full py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-800">
            <Settings className="h-5 w-5 text-gray-400" />
          </button>
          
          {/* User profile */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg p-1 transition-colors duration-150"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                <div className="bg-gray-800 w-full h-full rounded-full flex items-center justify-center">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "Admin"}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.firstName?.[0] || "A"}
                    </span>
                  )}
                </div>
              </div>
              <span className="hidden md:block text-sm">{user?.fullName || "Admin"}</span>
            </button>
            
            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="font-medium truncate">{user?.fullName || "Admin"}</p>
                  <p className="text-sm text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress || "admin@tipwave.com"}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab("settings");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-sm text-red-400 hover:text-red-300"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 