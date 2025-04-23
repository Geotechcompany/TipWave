import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export default function AdminRevenueChart({ stats, isLoading }) {
  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  // Ensure revenueByDay exists and has data
  const revenueData = stats?.revenueByDay || [];
  const maxRevenue = Math.max(...revenueData.map(item => item.amount || 0), 0);

  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden h-72"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6 border-b border-gray-700">
        <h3 className="font-semibold">Revenue Trends</h3>
      </div>
      <div className="p-6 relative h-48">
        {revenueData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No revenue data available
          </div>
        ) : (
          <>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-400">
              <span>${maxRevenue}</span>
              <span>${Math.floor(maxRevenue / 2)}</span>
              <span>$0</span>
            </div>

            {/* Chart bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2 ml-16">
              {revenueData.map((item, i) => (
                <div key={i} className="flex flex-col items-center w-1/7">
                  <div 
                    className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm"
                    style={{ 
                      height: `${((item.amount || 0) / maxRevenue) * 100}%`,
                      minHeight: '1px'
                    }}
                  />
                  <span className="mt-2 text-xs text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>

            {/* Tooltip */}
            <div className="absolute top-0 right-0 bg-gray-700/50 rounded-lg px-2 py-1 text-xs">
              <span className="text-green-400">+24%</span> vs last week
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
} 