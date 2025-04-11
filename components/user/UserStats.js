import { motion } from "framer-motion";
import { Music, UserCheck, DollarSign, Clock, TrendingUp } from "lucide-react";

export function UserStats({ stats, isLoading }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const statsData = [
    { 
      title: "Total Requests", 
      value: stats.totalBids, 
      icon: <Music className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/20",
      change: "+12%"
    },
    { 
      title: "Accepted Requests", 
      value: stats.wonBids, 
      icon: <UserCheck className="h-5 w-5 text-green-400" />,
      color: "from-green-500/20 to-green-600/20",
      border: "border-green-500/20",
      change: "+5%"
    },
    { 
      title: "Total Spent", 
      value: `$${stats.totalSpent.toFixed(2)}`, 
      icon: <DollarSign className="h-5 w-5 text-amber-400" />,
      color: "from-amber-500/20 to-amber-600/20",
      border: "border-amber-500/20",
      change: "+8%"
    },
    { 
      title: "Active Requests", 
      value: stats.activeBids?.length || 0, 
      icon: <Clock className="h-5 w-5 text-purple-400" />,
      color: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500/20",
      change: "0%"
    }
  ];

  return (
    <motion.div variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={`bg-gradient-to-br ${stat.color} backdrop-blur-lg rounded-2xl border ${stat.border} shadow-lg p-5 relative overflow-hidden`}
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-100/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-800/50 rounded-lg">{stat.icon}</div>
            <div className="flex items-center space-x-1 bg-gray-900/40 rounded-full px-2 py-0.5 text-xs">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-green-400">{stat.change}</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {isLoading ? '...' : stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
} 