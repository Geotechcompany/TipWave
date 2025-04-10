import { LayoutDashboard, Music, Clock, DollarSign, Settings } from "lucide-react";

export default function UserSidebar({ activeTab, setActiveTab }) {
  const navigationItems = [
    { tab: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: "bids", label: "My Bids", icon: <DollarSign className="w-5 h-5" /> },
    { tab: "history", label: "History", icon: <Clock className="w-5 h-5" /> },
    { tab: "songs", label: "Songs", icon: <Music className="w-5 h-5" /> },
    { tab: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="w-16 md:w-56 border-r border-gray-800 flex flex-col fixed h-[calc(100vh-64px)] z-20 bg-gray-900">
      <div className="p-3">
        <div className="hidden md:block text-xs font-medium text-gray-500 uppercase tracking-wider pb-4">
          Main Menu
        </div>
        <ul className="space-y-1">
          {navigationItems.map(item => (
            <li key={item.tab}>
              <button
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center w-full rounded-lg px-3 py-2 text-left ${
                  activeTab === item.tab 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                } transition-colors duration-150`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3 hidden md:block">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 