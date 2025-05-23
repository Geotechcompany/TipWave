import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Music } from "lucide-react";
import axios from "axios";


export default function AdminStats({ stats, isLoading, defaultCurrency }) {
  const [localCurrency, setLocalCurrency] = useState(defaultCurrency || { code: 'USD', symbol: '$' });
  
  // Fetch default currency if not provided as prop
  useEffect(() => {
    if (!defaultCurrency) {
      const fetchDefaultCurrency = async () => {
        try {
          const response = await axios.get('/api/admin/currencies');
          // The response includes a currencies array
          const currenciesData = response.data.currencies || response.data;
          
          // Find default currency
          const defaultCurr = currenciesData.find(c => c.isDefault) || 
                           currenciesData.find(c => c.code === 'KES') ||
                           (currenciesData.length > 0 ? currenciesData[0] : { code: 'USD', symbol: '$' });
          
          setLocalCurrency(defaultCurr);
        } catch (error) {
          console.error('Error fetching default currency:', error);
          // Keep fallback USD values
        }
      };
      
      fetchDefaultCurrency();
    } else {
      setLocalCurrency(defaultCurrency);
    }
  }, [defaultCurrency]);

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const formatCurrency = (amount) => {
    return `${localCurrency.symbol || defaultCurrency?.symbol || '$'}${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers.toLocaleString()} 
        icon={<Users className="h-5 w-5" />}
        color="bg-blue-500/20 text-blue-500"
        change="+12%"
      />
      
      <StatCard 
        title="Total Revenue" 
        value={formatCurrency(stats.totalRevenue)} 
        icon={<DollarSign className="h-5 w-5" />}
        color="bg-green-500/20 text-green-500"
        change="+24%"
      />
      
      <StatCard 
        title="Active DJs" 
        value={stats.activeDJs.toLocaleString()} 
        icon={<Music className="h-5 w-5" />}
        color="bg-purple-500/20 text-purple-500"
        change="+8%"
      />
      
      <StatCard 
        title="Total Songs" 
        value={stats.totalSongs.toLocaleString()} 
        icon={<Music className="h-5 w-5" />}
        color="bg-amber-500/20 text-amber-500"
        change="+15%"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color, change }) {
  return (
    <motion.div 
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center text-xs text-gray-400">
        <span className={change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
          {change}
        </span>
        <span className="ml-1">vs last month</span>
      </div>
    </motion.div>
  );
} 