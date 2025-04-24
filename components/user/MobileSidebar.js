"use client";

import { motion, AnimatePresence } from "framer-motion";
/* eslint-disable no-unused-vars */
import { 
  LayoutDashboard, Music, Clock, DollarSign,
  TrendingUp, Zap,
  BarChart2, User, Menu,
  Settings, Wallet, LogOut, X, ChevronRight, Calendar
} from "lucide-react";
/* eslint-enable no-unused-vars */
import { useSession } from "next-auth/react";
import Image from "next/image";

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
            className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 p-4 z-50 lg:hidden"
          >
            {/* User Profile Section */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt={session?.user?.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
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
              <NavItem
                icon={<Calendar className="w-5 h-5" />}
                label="Events"
                isActive={selectedView === "events"}
                onClick={() => handleNavigation("events")}
              />
              <NavItem
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                isActive={selectedView === "settings"}
                onClick={() => handleNavigation("settings")}
              />
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
      }
    `}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
); 