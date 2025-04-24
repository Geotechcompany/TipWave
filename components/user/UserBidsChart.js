import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function UserBidsChart({  isLoading }) {
  // Mock data for the chart
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    amount: Math.floor(Math.random() * 80) + 20
  }));

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Bidding Activity</h3>
          <p className="text-sm text-gray-400 mt-1">Your weekly bidding overview</p>
        </div>
        <div className="flex items-center text-green-500 text-sm">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          <span>+17% vs last week</span>
        </div>
      </div>
      <div className="p-6 h-64">
        {isLoading ? (
          <div className="animate-pulse h-full">
            <div className="h-full bg-gray-700 rounded-lg"></div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {chartData.map((item, i) => (
                <div key={i} className="flex flex-col items-center w-1/7">
                  <div 
                    className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm"
                    style={{ height: `${item.amount}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 