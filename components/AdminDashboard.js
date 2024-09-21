import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, DollarSign, Settings } from "lucide-react";

import CurrencySwitcher from "./switchers/currencySwitcher";

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [commission, setCommission] = useState(10);
  const [stats, setStats] = useState({
    users: 0,
    djs: 0,
    totalBids: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Fetch stats
    // This is where you'd typically make API calls
    setStats({
      users: 1000,
      djs: 50,
      totalBids: 5000,
      totalRevenue: 10000,
    });
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neon-blue">Admin Dashboard</h1>
        <CurrencySwitcher
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Platform Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">Total Users</h3>
              <p className="text-2xl text-neon-pink">{stats.users}</p>
            </div>
            <div>
              <h3 className="font-bold">Total DJs</h3>
              <p className="text-2xl text-neon-pink">{stats.djs}</p>
            </div>
            <div>
              <h3 className="font-bold">Total Bids</h3>
              <p className="text-2xl text-neon-pink">{stats.totalBids}</p>
            </div>
            <div>
              <h3 className="font-bold">Total Revenue</h3>
              <p className="text-2xl text-neon-pink">
                {stats.totalRevenue} {selectedCurrency}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dark-gray p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Settings className="mr-2" /> Platform Settings
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Commission Rate</h3>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(parseInt(e.target.value))}
                  className="w-full mr-4"
                />
                <span className="text-2xl text-neon-pink">{commission}%</span>
              </div>
            </div>
            <button className="bg-neon-blue hover:bg-neon-blue/80 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
