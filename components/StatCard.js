import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle,
  color = "blue", // Supports: blue, green, purple, orange, pink
  isCurrency = false,
  currencySymbol = "$",
  onClick,
  isLoading = false
}) => {
  // Gradient and color configurations
  const colorConfigs = {
    blue: {
      gradient: "from-blue-600/20 to-blue-800/10",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    green: {
      gradient: "from-green-600/20 to-green-800/10",
      border: "border-green-500/20", 
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400"
    },
    purple: {
      gradient: "from-purple-600/20 to-purple-800/10",
      border: "border-purple-500/20",
      iconBg: "bg-purple-500/10", 
      iconColor: "text-purple-400"
    },
    orange: {
      gradient: "from-orange-600/20 to-orange-800/10",
      border: "border-orange-500/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400"
    },
    pink: {
      gradient: "from-pink-600/20 to-pink-800/10", 
      border: "border-pink-500/20",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-400"
    }
  };
  
  const colorConfig = colorConfigs[color] || colorConfigs.blue;

  // Format value if it's currency
  const formattedValue = isCurrency 
    ? `${currencySymbol}${parseFloat(value || 0).toFixed(2)}`
    : value;
  
  // Improved trend handling
  const getTrendInfo = () => {
    if (!trend && trend !== 0) return null;
    
    // Parse the trend value
    let trendValue = trend;
    let isPositive = true;
    
    if (typeof trend === 'string') {
      isPositive = !trend.startsWith('-');
      trendValue = trend.replace(/[^0-9.]/g, '');
    } else {
      isPositive = trend >= 0;
      trendValue = Math.abs(trend);
    }
    
    return {
      isPositive,
      value: trendValue,
      color: isPositive ? 'text-green-500' : 'text-red-500',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };
  
  const trendInfo = getTrendInfo();
  
  // Render the icon based on its type
  const renderIcon = () => {
    if (!Icon) return null;
    
    if (typeof Icon === 'function') {
      return <Icon className={`h-6 w-6 ${colorConfig.iconColor}`} />;
    }
    
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, { 
        className: `h-6 w-6 ${colorConfig.iconColor}`
      });
    }
    
    return null;
  };
  
  return (
    <motion.div 
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${colorConfig.gradient} ${colorConfig.border} 
                 border rounded-xl p-6 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-700/50 animate-pulse rounded mt-2"></div>
          ) : (
            <h3 className="text-2xl font-bold mt-1 text-white tracking-tight">
              {formattedValue}
            </h3>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 ${colorConfig.iconBg} rounded-lg`}>
          {renderIcon()}
        </div>
      </div>
      
      {trendInfo && (
        <div className="mt-4 flex items-center text-sm">
          <trendInfo.icon className={`h-4 w-4 mr-1 ${trendInfo.color}`} />
          <span className={trendInfo.color}>
            {typeof trendInfo.value === 'number' 
              ? `${trendInfo.value}%` 
              : `${trendInfo.value}%`} 
            from previous period
          </span>
        </div>
      )}
    </motion.div>
  );
};
