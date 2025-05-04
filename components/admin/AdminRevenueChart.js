import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, TrendingDown, Download, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";

export default function AdminRevenueChart({ initialStats = null, defaultCurrency }) {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(!initialStats);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("week"); // week, month, quarter, year
  const [showTooltip, setShowTooltip] = useState(null);
  
  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/admin/stats/revenue?range=${dateRange}`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);
  
  useEffect(() => {
    if (!initialStats) {
      fetchRevenueData();
    }
  }, [initialStats, fetchRevenueData]);
  
  // Ensure revenueByDay exists and has data
  const revenueData = stats?.revenueByDay || [];
  
  // Calculate metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const maxRevenue = Math.max(...revenueData.map(item => item.amount || 0), 1); // Prevent division by zero
  
  // Calculate percentage change (assuming the first item is the oldest)
  const oldestValue = revenueData[0]?.amount || 0;
  const newestValue = revenueData[revenueData.length - 1]?.amount || 0;
  const percentChange = oldestValue ? ((newestValue - oldestValue) / oldestValue) * 100 : 0;
  const isPositiveChange = percentChange >= 0;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency?.code || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div 
      className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5 border-b border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Revenue Trends</h3>
            <p className="text-xs text-gray-400">Analysis of your recent sales data</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs bg-gray-900/80 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          
          <button 
            onClick={fetchRevenueData}
            className="text-xs bg-gray-900/80 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Summary section */}
      <div className="grid grid-cols-3 gap-4 py-4 px-6 border-b border-gray-700/50">
        <div>
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-xl font-semibold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Average</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(totalRevenue / (revenueData.length || 1))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1 flex items-center">
            Change
            {isPositiveChange ? (
              <TrendingUp className="h-3 w-3 ml-1 text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 ml-1 text-red-400" />
            )}
          </p>
          <p className={`text-xl font-semibold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
            {percentChange.toFixed(1)}%
          </p>
        </div>
      </div>
      
      {/* Chart section */}
      <div className="p-6 relative h-64">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-gray-400"
            >
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
              <p className="text-sm">Loading revenue data...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-gray-400"
            >
              <p className="text-red-400 mb-2">{error}</p>
              <button 
                onClick={fetchRevenueData}
                className="text-xs bg-gray-700 rounded-lg px-3 py-1.5 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : revenueData.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-gray-400"
            >
              <Calendar className="h-8 w-8 mb-2 text-gray-600" />
              <p className="text-sm mb-1">No revenue data available</p>
              <p className="text-xs text-gray-500">Try selecting a different time period</p>
            </motion.div>
          ) : (
            <motion.div 
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* Y-axis grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-full h-px bg-gray-700/30"
                    style={{ top: `${i * 25}%` }}
                  />
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
                <span>{formatCurrency(maxRevenue)}</span>
                <span>{formatCurrency(maxRevenue * 0.75)}</span>
                <span>{formatCurrency(maxRevenue * 0.5)}</span>
                <span>{formatCurrency(maxRevenue * 0.25)}</span>
                <span>{formatCurrency(0)}</span>
              </div>

              {/* Chart bars */}
              <div className="absolute inset-0 flex items-end justify-between pl-12 pr-4">
                {revenueData.map((item, i) => {
                  const heightPercentage = ((item.amount || 0) / maxRevenue) * 100;
                  
                  return (
                    <div 
                      key={i} 
                      className="flex flex-col items-center group"
                      style={{ width: `${100 / revenueData.length}%` }}
                      onMouseEnter={() => setShowTooltip(i)}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <motion.div 
                        className="w-full max-w-[30px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm relative cursor-pointer"
                        style={{ maxWidth: "18px" }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercentage, 1)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        whileHover={{ opacity: 0.9 }}
                      >
                        {/* Animated dot on top of each bar */}
                        <motion.div
                          className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-blue-300"
                          style={{ x: "-50%" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + (i * 0.05) }}
                        />
                        
                        {/* Tooltip */}
                        {showTooltip === i && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10"
                          >
                            <div className="font-medium">{formatCurrency(item.amount || 0)}</div>
                            <div className="text-gray-400 text-[10px]">{item.day}</div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                          </motion.div>
                        )}
                      </motion.div>
                      <span className="mt-2 text-xs text-gray-500">{item.day}</span>
                    </div>
                  );
                })}
              </div>

              {/* Trend line */}
              <svg className="absolute inset-0 pl-12 pr-4 pointer-events-none" style={{ height: '100%', width: '100%' }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  d={revenueData.map((item, i) => {
                    const x = (i / (revenueData.length - 1)) * 100;
                    const y = 100 - (((item.amount || 0) / maxRevenue) * 100);
                    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {revenueData.map((item, i) => {
                  const x = (i / (revenueData.length - 1)) * 100;
                  const y = 100 - (((item.amount || 0) / maxRevenue) * 100);
                  
                  return (
                    <motion.circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="#3b82f6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + (i * 0.05) }}
                    />
                  );
                })}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 border-t border-gray-700/50 flex justify-between items-center">
        <p className="text-xs text-gray-400">
          Updated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
        <motion.button 
          whileHover={{ x: 3 }}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors"
        >
          View detailed report <ArrowRight className="ml-1 h-3 w-3" />
        </motion.button>
      </div>
    </motion.div>
  );
} 