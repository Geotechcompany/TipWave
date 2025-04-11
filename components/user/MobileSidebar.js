import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Music, Clock, DollarSign, 
  TrendingUp, Zap, ChevronRight, Settings, 
  Calendar, BarChart2, User, X, Menu
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export function MobileSidebar({ isOpen, setIsOpen, selectedView, setSelectedView }) {
  const { user } = useUser();

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
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 shadow-2xl z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    TipWave
                  </h1>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                    <div className="bg-gray-900 w-full h-full rounded-full p-0.5">
                      <Image
                        src={user?.imageUrl || "https://placehold.co/100x100/1f2937/FFFFFF?text=User"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <h2 className="font-medium">{user?.fullName || "Guest User"}</h2>
                  <p className="text-sm text-gray-400">Music Enthusiast</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: LayoutDashboard },
                  { id: "requests", label: "My Requests", icon: Music },
                  { id: "history", label: "Request History", icon: Clock },
                  { id: "analytics", label: "Analytics", icon: BarChart2 },
                  { id: "activity", label: "Activity", icon: TrendingUp },
                  { id: "events", label: "Events", icon: Calendar },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      selectedView === item.id 
                        ? "bg-blue-600/20 text-blue-500" 
                        : "hover:bg-gray-800/50 text-gray-300"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-gray-800">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors rounded-xl font-medium"
              >
                <DollarSign className="h-5 w-5" />
                <span>New Request</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 