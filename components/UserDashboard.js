import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

// Import modular components
import UserHeader from "./user/UserHeader";
import UserSidebar from "./user/UserSidebar";
import UserStats from "./user/UserStats";
import UserBidsChart from "./user/UserBidsChart";
import UserActiveBids from "./user/UserActiveBids";
import UserHistory from "./user/UserHistory";
import UserSettings from "./user/UserSettings";

export default function UserDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalBids: 0,
    wonBids: 0,
    totalSpent: 0,
    activeBids: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      // Mock data for now
      setStats({
        totalBids: 47,
        wonBids: 23,
        totalSpent: 450,
        activeBids: generateMockBids()
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  function generateMockBids() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `bid-${i}`,
      song: `Song ${i + 1}`,
      amount: Math.floor(Math.random() * 50) + 10,
      status: ["PENDING", "ACCEPTED", "REJECTED"][i % 3],
      createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString()
    }));
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <UserHeader 
        user={user}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationsRef={notificationsRef}
      />

      <div className="flex pt-16 min-h-screen">
        <UserSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 p-6 ml-16 md:ml-56">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <UserStats 
                stats={stats}
                isLoading={isLoading}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />
              
              <UserBidsChart 
                stats={stats}
                isLoading={isLoading}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserActiveBids 
                  stats={stats}
                  isLoading={isLoading}
                />
                
                <UserHistory 
                  stats={stats}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
          
          {activeTab === "settings" && <UserSettings user={user} />}
        </div>
      </div>
    </div>
  );
}
