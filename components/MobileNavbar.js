import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Calendar, MapPin, Users, Settings, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/venues', label: 'Venues', icon: MapPin },
    { href: '/fans', label: 'Fans', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  
  const isActive = (path) => router.pathname === path;
  
  return (
    <>
      {/* Mobile Menu Button - Fixed in the bottom right corner */}
      <button 
        onClick={toggleMenu}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                <div>
                  <h2 className="font-bold text-lg">{session?.user?.name || 'DJ Portal'}</h2>
                  <p className="text-sm text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg ${
                        isActive(item.href) 
                          ? 'bg-blue-600/20 text-blue-400' 
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => signOut()}
                className="flex items-center w-full px-4 py-3 text-left text-red-400 hover:bg-gray-800/50 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 