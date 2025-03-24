import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Music,
  Users,
  BarChart as BarChartIcon,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useClerk } from "@clerk/clerk-react";
import ActiveBidsChart from "./ActiveBidsChart";
import ActiveBids from "./ActiveBids";
import InviteFriendsCard from "./InviteFriendsCard";

import SongSearch from "./SongSearch";
import SongQueue from "./SongQueue";
import FavoriteDJs from "./FavoriteDJs";
import StatCard from "./StatCard";
import ChartCard from "./ChartCard";
import BarChart from "./BarChart";
import { toast } from "react-hot-toast";
import PopularSongs from './PopularSongs';

export default function UserDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBids: 0,
    wonBids: 0,
    totalSpent: 0,
    activeBids: [],
  });
  const [selectedSong, setSelectedSong] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error("Failed to fetch user stats");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const userRole = user?.publicMetadata?.role || "USER";
  const profileImageUrl = user?.imageUrl || "/images/default-avatar.png";
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || "demo@minimals.cc";

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      tab: "dashboard",
    },
    { icon: <Search size={20} />, label: "Song Search", tab: "search" },
    { icon: <Music size={20} />, label: "Song Queue", tab: "queue" },
    { icon: <Users size={20} />, label: "Favorite DJs", tab: "favorites" },
    {
      icon: <BarChartIcon size={20} />,
      label: "Active Bids",
      tab: "activeBids",
    },
  ];

  const handleBidClick = (song) => {
    setSelectedSong(song);
    setIsBidModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "search":
        return (
          <div className="space-y-8">
            <SongSearch onBidPlaced={fetchUserStats} />
            <PopularSongs onBidClick={handleBidClick} />
          </div>
        );
      case "queue":
        return <SongQueue />;
      case "favorites":
        return <FavoriteDJs />;
      case "activeBids":
        return (
          <div className="space-y-6">
            <ChartCard
              title="Active Bids Overview"
              chart={<ActiveBidsChart activeBids={userStats.activeBids} />}
            />
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
              <ActiveBids activeBids={userStats.activeBids} />
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Bids"
                value={userStats.totalBids.toString()}
                icon={<DollarSign />}
                color="bg-blue-100"
              />
              <StatCard
                title="Won Bids"
                value={userStats.wonBids.toString()}
                icon={<Users />}
                color="bg-purple-100"
              />
              <StatCard
                title="Total Spent"
                value={`$${userStats.totalSpent.toFixed(2)}`}
                icon={<Music />}
                color="bg-yellow-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="Active Bids"
                chart={<ActiveBidsChart activeBids={userStats.activeBids} />}
              />
              <InviteFriendsCard onInvite={handleInviteFriend} />
            </div>
          </>
        );
    }
  };

  const handleInviteFriend = async (email) => {
    try {
      const response = await fetch('/api/invite-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send invite');
      }
      
      toast.success('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Add the logo here */}
            <div className="flex items-center">
              <Image
                src="/images/logo-dark.png"
                alt="Site Logo"
                width={150}
                height={80}
                className="object-contain"
              />
            </div>

            {/* Existing top bar content */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-400">
                <Search size={20} />
              </button>

              <button className="text-gray-400">
                <Bell size={20} />
              </button>
              <button className="text-gray-400">
                <Settings size={20} />
              </button>
              {/* <Image
                src="/path-to-flag-icon.png"
                alt="Language"
                width={20}
                height={20}
              /> */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2"
                >
                  <Image
                    src={profileImageUrl}
                    alt={user?.fullName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md flex flex-col">
          <nav className="flex-1 mt-5 px-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
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

          {/* User Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Image
                  src={profileImageUrl}
                  alt={user?.fullName || "User"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <span className="absolute top-0 right-0 bg-green-400 text-xs text-white px-2 py-0.5 rounded-full">
                  Free
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {user?.fullName || "Jaydon Frankie"}
              </h3>
              <p className="text-xs text-gray-500">{userEmail}</p>
              <button className="mt-3 w-full bg-gray-900 text-white rounded-md py-2 text-sm hover:bg-gray-700 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold mb-8">
            Hi, Welcome back {user?.firstName}! 👋
          </h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
