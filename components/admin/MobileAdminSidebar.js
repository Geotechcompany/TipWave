import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Users, Music, Settings, LayoutDashboard, 
  DollarSign, BarChart2, FileCheck, Mail, CreditCard, Wallet
} from "lucide-react";
import { Button } from "../ui/button";

export function MobileAdminSidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

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
      tab: "payment-methods", 
      label: "Payment Methods", 
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-red-500 to-pink-600"
    },
    { 
      tab: "withdrawal-methods", 
      label: "Withdrawal Methods", 
      icon: <Wallet className="w-5 h-5" />,
      color: "from-purple-500 to-indigo-600"
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
    {
      tab: "withdrawals",
      label: "Withdrawals",
      icon: <Wallet className="h-5 w-5" />,
      color: "from-emerald-500 to-teal-600"
    },
  ];

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800/50 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-900 border-r border-gray-700/50 shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Admin Panel
                  </h2>
                </div>

                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <motion.button
                      key={item.tab}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(item.tab);
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full rounded-lg px-3 py-3 text-left
                        ${activeTab === item.tab 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg ring-1 ring-white/10` 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        } transition-all duration-150`}
                    >
                      <span className={`flex-shrink-0 ${activeTab === item.tab ? 'text-white' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      <span className="ml-3 font-medium">
                        {item.label}
                      </span>
                      {activeTab === item.tab && (
                        <motion.span 
                          layoutId="mobileActiveIndicator"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>

                <div className="mt-6 rounded-lg p-4 bg-black/20 border border-gray-700/50">
                  <div className="text-xs text-gray-400">
                    <div className="font-semibold mb-1 text-gray-300">Need help?</div>
                    <p>Access documentation and support through the settings panel.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 