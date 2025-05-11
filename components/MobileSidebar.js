import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { 
  X, 
  Menu, 
  Home, 
  Calendar, 
  Music, 
  DollarSign, 
  BarChart2, 
  Settings, 
  MessageSquare,
  UserCircle,
  LogOut,
 
  ListMusic,
  Zap,
  CheckCircle,
  Wallet
} from 'lucide-react';

export function MobileSidebar({ activeView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'requests', label: 'Song Requests', icon: Music },
    { id: 'library', label: 'Music Library', icon: ListMusic },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'withdrawals', label: 'Withdrawals', icon: Wallet }
  ];

  const handleViewSelect = (view) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <>
      {/* Toggle Button - Moved to left side */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600 text-white shadow-lg"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Now slides from left */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 z-50 shadow-lg flex flex-col lg:hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-xl">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col flex-1 overflow-y-auto">
              <div className="flex-1">
                <nav className="p-4">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewSelect(item.id)}
                        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-600/20 text-blue-400' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Upgrade Banner - Add this section */}
              <div className="p-4 border-t border-gray-800">
                <div className="rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <div className="flex items-center mb-3">
                      <Zap className="h-5 w-5 text-yellow-300 mr-2" />
                      <h3 className="font-bold text-white">Upgrade to Pro</h3>
                    </div>
                    
                    <p className="text-sm text-white/80 mb-3">
                      Unlock premium features and boost your earnings
                    </p>
                    
                    <ul className="text-xs text-white/80 mb-4 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                        <span>Custom branding</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                        <span>Priority requests</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 text-green-300 mr-2" />
                        <span>Advanced analytics</span>
                      </li>
                    </ul>
                    
                    <button 
                      onClick={() => {
                        router.push('/pricing');
                        setIsOpen(false);
                      }}
                      className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer with Logout */}
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 