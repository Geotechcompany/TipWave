import React from "react";

export const StatCard = ({ title, value, icon, trend }) => {
  const trendColor = trend?.startsWith('+') ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          {icon}
        </div>
      </div>
      {trend && (
        <p className={`mt-2 text-sm ${trendColor}`}>
          {trend} from last month
        </p>
      )}
    </div>
  );
};
