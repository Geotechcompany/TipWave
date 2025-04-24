"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp, PieChart } from "lucide-react";


export function BiddingAnalytics({ stats = {}, isLoading = false }) {
  // Optional time filtering could be implemented later
  // const [timeRange, setTimeRange] = useState("month");

  // Destructure stats with default values
  const {
    totalBids = 0,
    wonBids = 0,
    totalSpent = 0,
    pastBids = [],
    activeBids = []
  } = stats;

  // Calculate success rate and other metrics
  const successRate = ((wonBids / (totalBids || 1)) * 100) || 0;
  const averageBidAmount = totalSpent / (totalBids || 1) || 0;
  
  const analyticsStats = [
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      change: "+5%",
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Average Bid",
      value: `$${averageBidAmount.toFixed(2)}`,
      change: "+12%",
      icon: <BarChart2 className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/20"
    }
  ];

  // Calculate bid distribution by status
  const bidDistribution = {
    COMPLETED: wonBids || 0,
    PENDING: activeBids?.filter(bid => bid.status === 'PENDING')?.length || 0,
    REJECTED: pastBids?.filter(bid => bid.status === 'REJECTED')?.length || 0
  };

  // Calculate total bids for percentage calculation
  const totalDistributionBids = 
    bidDistribution.COMPLETED + 
    bidDistribution.PENDING + 
    bidDistribution.REJECTED;

  // Calculate DJ success rates
  const djStats = pastBids?.reduce((acc, bid) => {
    const dj = acc.find(d => d.name === bid.djName);
    if (dj) {
      dj.total++;
      if (bid.status === 'COMPLETED') dj.won++;
    } else {
      acc.push({
        name: bid.djName || 'Unknown DJ',
        total: 1,
        won: bid.status === 'COMPLETED' ? 1 : 0
      });
    }
    return acc;
  }, []) || [];

  const topDJs = djStats
    .sort((a, b) => (b.won / (b.total || 1)) - (a.won / (a.total || 1)))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i}
              className="h-32 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50" />
        <div className="h-96 bg-gray-800/50 animate-pulse rounded-xl border border-gray-700/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyticsStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`
              relative p-6 rounded-xl border border-gray-800/50
              bg-gradient-to-br ${stat.color}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="p-2 rounded-lg bg-gray-900/30">
                {stat.icon}
              </span>
            </div>
            <p className="text-sm text-gray-400">{stat.title}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className="text-sm text-green-400">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bid Distribution Visualization */}
      {totalDistributionBids > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-400" />
            Bid Status Distribution
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-green-400">{bidDistribution.COMPLETED}</span>
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-xs text-gray-500 mt-1">
                {totalDistributionBids ? 
                  `${((bidDistribution.COMPLETED / totalDistributionBids) * 100).toFixed(1)}%` 
                  : '0%'}
              </span>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-400">{bidDistribution.PENDING}</span>
              <span className="text-sm text-gray-400">Pending</span>
              <span className="text-xs text-gray-500 mt-1">
                {totalDistributionBids ? 
                  `${((bidDistribution.PENDING / totalDistributionBids) * 100).toFixed(1)}%` 
                  : '0%'}
              </span>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-red-400">{bidDistribution.REJECTED}</span>
              <span className="text-sm text-gray-400">Rejected</span>
              <span className="text-xs text-gray-500 mt-1">
                {totalDistributionBids ? 
                  `${((bidDistribution.REJECTED / totalDistributionBids) * 100).toFixed(1)}%` 
                  : '0%'}
              </span>
            </div>
          </div>
          
          {/* Visual bar representation */}
          <div className="h-8 flex rounded-md overflow-hidden">
            {bidDistribution.COMPLETED > 0 && (
              <div 
                className="bg-green-500/70 h-full" 
                style={{ 
                  width: `${(bidDistribution.COMPLETED / totalDistributionBids) * 100}%` 
                }}
                title={`${bidDistribution.COMPLETED} Completed Bids`}
              />
            )}
            {bidDistribution.PENDING > 0 && (
              <div 
                className="bg-yellow-500/70 h-full" 
                style={{ 
                  width: `${(bidDistribution.PENDING / totalDistributionBids) * 100}%` 
                }}
                title={`${bidDistribution.PENDING} Pending Bids`}
              />
            )}
            {bidDistribution.REJECTED > 0 && (
              <div 
                className="bg-red-500/70 h-full" 
                style={{ 
                  width: `${(bidDistribution.REJECTED / totalDistributionBids) * 100}%` 
                }}
                title={`${bidDistribution.REJECTED} Rejected Bids`}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Top DJs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700 p-6"
      >
        <h3 className="font-semibold mb-4">Top DJs by Success Rate</h3>
        <div className="space-y-4">
          {topDJs.length > 0 ? (
            topDJs.map((dj) => (
              <div key={dj.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dj.name}</p>
                  <p className="text-sm text-gray-400">{dj.won} won of {dj.total} requests</p>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(dj.won / dj.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-green-400">
                    {((dj.won / (dj.total || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No DJ history available yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 