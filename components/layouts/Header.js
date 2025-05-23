import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChevronDown,
  Menu,
  X,
  Music,
  Building2,
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
  Info,
  Phone,
  
} from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = {
    product: {
      title: "Product",
      items: [
        {
          icon: <Music className="w-5 h-5 text-blue-400" />,
          title: "For DJs",
          description: "Tools and features for DJs",
          href: "/for-djs",
        },
        {
          icon: <Building2 className="w-5 h-5 text-purple-400" />,
          title: "For Venues",
          description: "Solutions for venue management",
          href: "/for-venues",
        },
      ],
    },
    resources: {
      title: "Resources",
      items: [
        {
          icon: <BookOpen className="w-5 h-5 text-green-400" />,
          title: "Documentation",
          description: "Detailed guides and API docs",
          href: "/documentation",
        },
        {
          icon: <MessageSquare className="w-5 h-5 text-yellow-400" />,
          title: "Blog",
          description: "Latest news and updates",
          href: "/blog",
        },
        {
          icon: <HelpCircle className="w-5 h-5 text-pink-400" />,
          title: "Support",
          description: "Get help when you need it",
          href: "/support",
        },
        {
          icon: <Users className="w-5 h-5 text-indigo-400" />,
          title: "Community",
          description: "Join our DJ community",
          href: "/community",
        },
      ],
    },
    company: {
      title: "Company",
      items: [
        {
          icon: <Info className="w-5 h-5 text-cyan-400" />,
          title: "About",
          description: "Our mission and values",
          href: "/about",
        },
        {
          icon: <FileText className="w-5 h-5 text-orange-400" />,
          title: "Legal",
          description: "Terms and privacy",
          href: "/terms",
        },
        {
          icon: <Phone className="w-5 h-5 text-teal-400" />,
          title: "Contact",
          description: "Get in touch with us",
          href: "/contact",
        },
      ],
    },
  };

  const handleMenuEnter = (menu) => {
    clearTimeout(window.menuTimeout);
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    window.menuTimeout = setTimeout(() => {
      setActiveMenu(null);
    }, 300);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              TipWave
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {Object.entries(menuItems).map(([key, section]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMenuEnter(key)}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors py-2"
                  aria-expanded={activeMenu === key}
                >
                  <span>{section.title}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === key ? 'rotate-180' : ''
                  }`} />
                </button>

                <AnimatePresence>
                  {activeMenu === key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 min-w-[300px] mt-2 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl"
                    >
                      <div className="p-4 grid gap-2">
                        {section.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-start p-3 rounded-lg hover:bg-white/5 transition-colors"
                            onClick={() => {
                              setActiveMenu(null);
                            }}
                          >
                            <div className="flex-shrink-0">
                              {item.icon}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-white">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-400">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {session ? (
                <button
                  onClick={() => router.push('/dashboard/user')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/user')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {Object.entries(menuItems).map(([key, section]) => (
                  <div key={key} className="py-2">
                    <div className="px-3 text-white font-medium">{section.title}</div>
                    <div className="mt-2 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
                        >
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
} 