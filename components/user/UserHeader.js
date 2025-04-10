import { Bell, Settings, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UserHeader({ 
  user, 
  showNotifications, 
  setShowNotifications, 
  notificationsRef 
}) {
  const notifications = [
    { id: 1, type: 'success', message: 'Your bid for "Uptown Funk" was accepted', time: '10m ago' },
    { id: 2, type: 'info', message: 'New DJ spotlight: DJ Quantum is now live', time: '2h ago' },
    { id: 3, type: 'alert', message: 'Your payment method will expire soon', time: '1d ago' }
  ];

  return (
    <div className="fixed top-0 right-0 left-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            SongBid
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-700 relative"
            >
              <Bell className="h-5 w-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-gray-700/50 cursor-pointer">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src={user?.imageUrl || "/default-avatar.png"}
                  alt="Profile"
                  width={32}
                  height={32}
                />
              </div>
              <span className="ml-2 text-sm hidden md:block">{user?.fullName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 