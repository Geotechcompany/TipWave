import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function AdminRevenueChart({ stats, isLoading }) {
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Revenue Overview</h3>
          <p className="text-sm text-gray-400 mt-1">Weekly revenue performance</p>
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
            {/* Simple line chart implementation */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {stats.revenueByDay.map((item, i) => (
                <div key={i} className="flex flex-col items-center w-1/7">
                  <div 
                    className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm"
                    style={{ height: `${(item.amount / 1000) * 70}%` }}
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