import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Music,
  Users,
  BarChartIcon,
  Settings,
  DollarSign,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { useClerk } from "@clerk/clerk-react";
import { StatCard } from './StatCard';

export default function AdminDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigationItems = [
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { tab: "songs", label: "Songs", icon: <Music className="w-5 h-5" /> },
    { tab: "bids", label: "Bids", icon: <DollarSign className="w-5 h-5" /> },
    { tab: "analytics", label: "Analytics", icon: <BarChartIcon className="w-5 h-5" /> },
    { tab: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admin Stats Cards */}
            <StatCard
              title="Total Users"
              value="1,234"
              icon={<Users className="w-6 h-6" />}
              trend="+12%"
            />
            <StatCard
              title="Total Bids"
              value="5,678"
              icon={<DollarSign className="w-6 h-6" />}
              trend="+8%"
            />
            <StatCard
              title="Active Songs"
              value="890"
              icon={<Music className="w-6 h-6" />}
              trend="+15%"
            />
          </div>
        );
      case "users":
        return <div>Users Management</div>;
      case "songs":
        return <div>Songs Management</div>;
      case "bids":
        return <div>Bids Management</div>;
      case "analytics":
        return <div>Analytics Dashboard</div>;
      case "settings":
        return <div>Admin Settings</div>;
      default:
        return <div>Dashboard</div>;
    }
  };

  const profileImageUrl = user?.imageUrl || "https://via.placeholder.com/64";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "admin@example.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">DJ TipSync Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`${
                    activeTab === item.tab
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Admin Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Image
                  src={profileImageUrl}
                  alt={user?.fullName || "Admin"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <span className="absolute top-0 right-0 bg-red-400 text-xs text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {user?.fullName || "Admin User"}
              </h3>
              <p className="text-xs text-gray-500">{userEmail}</p>
              <button
                onClick={() => signOut()}
                className="mt-3 w-full bg-gray-900 text-white rounded-md py-2 text-sm hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {user?.firstName || 'Admin'} 👋
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
