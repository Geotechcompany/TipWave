import { useState, useEffect } from "react";
import { 
  Users, Music, Settings, LayoutDashboard, 
  DollarSign, BarChart2, FileCheck, ChevronRight, Mail
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSidebar({ activeTab, setActiveTab, onCollapseChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);
  
  const navigationItems = [
    { 
      tab: "dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: "from-indigo-500 to-purple-600"
    },
    { 
      tab: "users", 
      label: "Users", 
      icon: <Users className="w-5 h-5" />,
      color: "from-cyan-500 to-blue-600"
    },
    { 
      tab: "songs", 
      label: "Songs", 
      icon: <Music className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600"
    },
    { 
      tab: "bids", 
      label: "Bids", 
      icon: <DollarSign className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600"
    },
    { 
      tab: "analytics", 
      label: "Analytics", 
      icon: <BarChart2 className="w-5 h-5" />,
      color: "from-pink-500 to-rose-600"
    },
    { 
      tab: "settings", 
      label: "Settings", 
      icon: <Settings className="w-5 h-5" />,
      color: "from-violet-500 to-purple-600"
    },
    { 
      tab: "djapplications", 
      label: "DJ Applications", 
      icon: <FileCheck className="w-5 h-5" />,
      color: "from-blue-500 to-teal-600"
    },
    { 
      tab: "emails", 
      label: "Emails", 
      icon: <Mail className="w-5 h-5" />,
      color: "from-purple-500 to-pink-600"
    },
  ];

  return (
    <motion.aside
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-16 bottom-0 ${isCollapsed ? 'w-16' : 'w-56'} 
        bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700/50 shadow-xl
        transition-all duration-300 ease-in-out z-20`}
    >
      <div className="p-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-sm font-medium text-gray-300 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
            Admin Panel
          </h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white
                      transition-colors duration-200"
          >
            <ChevronRight className={`w-4 h-4 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <ul className="space-y-2">
          {navigationItems.map(item => (
            <li key={item.tab}>
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center w-full rounded-lg px-3 py-3 text-left
                  ${activeTab === item.tab 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg ring-1 ring-white/10` 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  } transition-all duration-150`}
              >
                <span className={`flex-shrink-0 ${activeTab === item.tab ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className={`ml-3 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>
                  {item.label}
                </span>
                {activeTab === item.tab && !isCollapsed && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="ml-auto h-2 w-2 rounded-full bg-white"
                  />
                )}
              </motion.button>
            </li>
          ))}
        </ul>
        
        <div className={`mt-10 rounded-lg p-4 bg-black/20 border border-gray-700/50 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="text-xs text-gray-400">
            <div className="font-semibold mb-1 text-gray-300">Need help?</div>
            <p>Access documentation and support through the settings panel.</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
} 