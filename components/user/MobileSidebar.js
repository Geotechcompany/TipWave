"use client";

import { motion, AnimatePresence } from "framer-motion";
/* eslint-disable no-unused-vars */
import { 
  LayoutDashboard, Music, Clock, DollarSign,
  Settings, X, ChevronRight, Calendar, 
  Users, TrendingUp, Radio, Share2, FileText, Wallet
} from "lucide-react";
/* eslint-enable no-unused-vars */
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function MobileSidebar({ isOpen, setIsOpen, selectedView, setSelectedView }) {
  const { data: session } = useSession();

  const handleNavigation = (view) => {
    setSelectedView(view);
    setIsOpen(false);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 left-0 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 p-4 z-50 lg:hidden overflow-y-auto"
          >
            {/* User Profile Section */}
            <div className="flex items-center gap-3 mb-6 p-2 bg-gray-800/40 rounded-lg">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-blue-500/30">
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt={session?.user?.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {session?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email || "Sign in to access all features"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Main</h3>
              <nav className="space-y-1">
                <NavItem
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  label="Overview"
                  isActive={selectedView === "overview"}
                  onClick={() => handleNavigation("overview")}
                />
                <NavItem
                  icon={<Music className="w-5 h-5" />}
                  label="My Requests"
                  isActive={selectedView === "requests"}
                  onClick={() => handleNavigation("requests")}
                />
                <NavItem
                  icon={<Clock className="w-5 h-5" />}
                  label="History"
                  isActive={selectedView === "history"}
                  onClick={() => handleNavigation("history")}
                />
                <NavItem
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Spending"
                  isActive={selectedView === "spending"}
                  onClick={() => handleNavigation("spending")}
                />
              </nav>
            </div>

            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Discover</h3>
              <nav className="space-y-1">
                <NavItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="Events"
                  isActive={selectedView === "events"}
                  onClick={() => handleNavigation("events")}
                  badge={3}
                />
                <NavItem
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Trending Songs"
                  isActive={selectedView === "trending"}
                  onClick={() => handleNavigation("trending")}
                />
                <NavItem
                  icon={<Radio className="w-5 h-5" />}
                  label="Live DJs"
                  isActive={selectedView === "liveDJs"}
                  onClick={() => handleNavigation("liveDJs")}
                  badge="Live"
                  badgeColor="bg-red-500"
                />
                <NavItem
                  icon={<Share2 className="w-5 h-5" />}
                  label="Shared Playlists"
                  isActive={selectedView === "sharedPlaylists"}
                  onClick={() => handleNavigation("sharedPlaylists")}
                />
              </nav>
            </div>

            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Account</h3>
              <nav className="space-y-1">
                <NavItem
                  icon={<FileText className="w-5 h-5" />}
                  label="DJ Application"
                  isActive={selectedView === "DJApplication"}
                  onClick={() => handleNavigation("DJApplication")}
                />
                <NavItem
                  icon={<Wallet className="w-5 h-5" />}
                  label="Wallet"
                  isActive={selectedView === "wallet"}
                  onClick={() => handleNavigation("wallet")}
                />
                <NavItem
                  icon={<Settings className="w-5 h-5" />}
                  label="Settings"
                  isActive={selectedView === "settings"}
                  onClick={() => handleNavigation("settings")}
                />
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mt-auto pt-4 border-t border-gray-800">
              <Link href="/help-center">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Help Center
                </button>
              </Link>
              <Link href="/feedback">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Send Feedback
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const NavItem = ({ icon, label, isActive, onClick, badge, badgeColor = "bg-blue-500" }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
      ${isActive 
        ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' 
        : 'hover:bg-gray-800/70 text-gray-400 hover:text-white'
      }
    `}
  >
    <span className={`${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
      {icon}
    </span>
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    {badge && (
      <span className={`${badgeColor} text-white text-xs px-1.5 py-0.5 rounded-full`}>
        {badge}
      </span>
    )}
    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
  </button>
); 