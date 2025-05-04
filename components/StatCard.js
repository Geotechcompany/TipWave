import React from "react";
import { TrendingUp } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, trend }) => {
  // Improved trend color logic
  const getTrendColor = () => {
    if (!trend) return '';
    
    // Handle both string ('+5%') and number (5) formats
    const isPositive = typeof trend === 'string' 
      ? !trend.startsWith('-')
      : trend >= 0;
      
    return isPositive ? 'text-green-500' : 'text-red-500';
  };
  
  // Render the icon based on its type - improved to handle all cases
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If Icon is a function (component), render it with props
    if (typeof Icon === 'function') {
      return <Icon className="h-6 w-6 text-blue-400" />;
    }
    
    // If Icon is a valid React element (not just an object), clone it with proper props
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, { 
        className: "h-6 w-6 text-blue-400" 
      });
    }
    
    // If it's something else, render nothing
    return null;
  };
  
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          {renderIcon()}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className={`h-4 w-4 mr-1 ${getTrendColor()}`} />
          <span className={getTrendColor()}>
            {typeof trend === 'number' ? `${trend}%` : trend} from last period
          </span>
        </div>
      )}
    </div>
  );
};
