import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, Loader2, Music } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { WithdrawalModal } from "./WithdrawalModal";

export function EarningsPanel({ defaultCurrency = { code: 'USD', symbol: '$', rate: 1 } }) {
  const { data: session } = useSession();
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: [],
    recentTransactions: [],
    trends: { weekly: 0, monthly: 0 },
    songRequestEarnings: 0,
    totalCompletedRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Format currency with the correct symbol
  const formatCurrency = (amount) => {
    return `${defaultCurrency.symbol || '$'}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const fetchEarnings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/earnings?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      
      console.log("Earnings data received:", data);
      
      // Add specific calculation for song request earnings if not provided by API
      if (data.recentTransactions) {
        // Calculate song request earnings from all transactions with 'song request' in description
        const songRequestEarnings = data.recentTransactions
          .filter(tx => tx.type === 'income' && 
            (tx.description?.toLowerCase().includes('song request') || 
             tx.description?.toLowerCase().includes('accepted song')))
          .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
          
        data.songRequestEarnings = data.songRequestEarnings || songRequestEarnings;
        
        // Count completed requests
        const completedRequests = data.recentTransactions
          .filter(tx => tx.type === 'income' && 
            (tx.description?.toLowerCase().includes('song request') || 
             tx.description?.toLowerCase().includes('accepted song')))
          .length;
        
        data.totalCompletedRequests = data.totalCompletedRequests || completedRequests;
      }
      
      setEarnings(data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, timeframe]);

  // Add a direct database verification function to ensure all accepted requests are counted
  const verifyAcceptedRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      console.log("Verifying all accepted song requests in database");
      const response = await fetch(`/api/dj/${session.user.id}/requests/verify-earnings`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.warn("Verification API returned non-200 status:", response.status);
        return;
      }
      
      const data = await response.json();
      console.log("Verification result:", data);
      
      if (data.updated) {
        toast.success("Earnings updated with verified request data");
        // Refresh earnings data to show the updated values
        fetchEarnings();
      }
    } catch (error) {
      console.error("Error verifying accepted requests:", error);
    }
  }, [session?.user?.id, fetchEarnings]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEarnings();
    }
  }, [fetchEarnings, session?.user?.id]);

  // Update the handleRequestAccepted function in the useEffect at around line 76
  useEffect(() => {
    const handleRequestAccepted = () => {
      console.log("Request acceptance detected, refreshing earnings");
      // First try normal refresh
      setTimeout(() => {
        fetchEarnings();
        
        // Then verify database directly as backup to ensure accuracy
        setTimeout(() => {
          verifyAcceptedRequests();
        }, 2000); // Wait another second to verify
      }, 1000); // 1 second delay
    };
    
    window.addEventListener('request-accepted', handleRequestAccepted);
    
    return () => {
      window.removeEventListener('request-accepted', handleRequestAccepted);
    };
  }, [fetchEarnings, verifyAcceptedRequests]);

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Date', 'Type', 'Song', 'Requester', 'Amount'],
        ...earnings.recentTransactions.map(tx => [
          new Date(tx.date || tx.createdAt).toLocaleDateString(),
          tx.type || 'income',
          tx.songTitle || tx.description?.replace('Accepted song request: ', '') || 'Unknown',
          tx.requesterName || 'Anonymous',
          formatCurrency(tx.amount)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting earnings:', error);
      toast.error('Failed to export earnings data');
    }
  };

  // Function to handle opening the withdrawal modal
  const openWithdrawalModal = () => {
    setIsWithdrawing(true);
  };

  // Function to handle the completion of a withdrawal
  const handleWithdrawalComplete = () => {
    // Refresh earnings data after a successful withdrawal
    fetchEarnings();
    toast.success("Withdrawal request submitted successfully");
    setIsWithdrawing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 rounded-xl p-6 shadow-lg overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Your Earnings</h2>
        <div className="flex gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 border-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          
          {/* Add Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            disabled={isLoading || !earnings?.recentTransactions?.length}
          >
            Export CSV
          </button>
          
          <button
            onClick={openWithdrawalModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            disabled={isLoading || !earnings?.total || earnings.total <= 0}
          >
            <DollarSign className="h-4 w-4" />
            Withdraw Earnings
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Earnings"
              value={formatCurrency(earnings.total)}
              icon={DollarSign}
              trend={earnings.trends.monthly}
            />
            <StatCard
              title="Song Request Income"
              value={formatCurrency(earnings.songRequestEarnings || 0)}
              icon={Music}
              subtitle={`${earnings.totalCompletedRequests || 0} completed requests`}
            />
            <StatCard
              title={`This ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`}
              value={formatCurrency(earnings.monthly?.[earnings.monthly.length - 1]?.total || 0)}
              icon={Calendar}
              trend={earnings.trends.monthly}
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {earnings.recentTransactions && earnings.recentTransactions.length > 0 ? (
                earnings.recentTransactions.map((transaction) => (
                  <TransactionRow 
                    key={transaction._id || `tx-${Math.random()}`} 
                    {...transaction} 
                    currencySymbol={defaultCurrency.symbol}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  No recent transactions found
                </div>
              )}
            </div>
          </div>

        
        </>
      )}

      {/* Include the WithdrawalModal component */}
      <WithdrawalModal
        isOpen={isWithdrawing}
        onClose={() => setIsWithdrawing(false)}
        availableBalance={earnings.total || 0}
        defaultCurrency={defaultCurrency}
        onWithdrawalComplete={handleWithdrawalComplete}
      />
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, subtitle }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400">{title}</p>
          <h4 className="text-2xl font-bold mt-2">{value}</h4>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend}% from last period
          </span>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ date, amount, songTitle, requesterName, description, createdAt, type, currencySymbol = '$' }) {
  // Handle different transaction data structures
  const displayTitle = songTitle || (description && description.includes("Accepted song request:") 
    ? description.replace("Accepted song request:", "").trim() 
    : description) || "Payment";
    
  const displayDate = date || createdAt || new Date();
  const transactionType = type || (description && description.includes("Accepted song request:") ? "request" : "payment");
  const displayAmount = parseFloat(amount || 0);
  
  // Icon based on transaction type
  const getIcon = () => {
    if (transactionType === "request" || description?.includes("song request")) {
      return <Music className="h-5 w-5 text-blue-400" />;
    }
    return <DollarSign className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <p className="font-medium">{displayTitle}</p>
          {requesterName && <p className="text-sm text-gray-400">from {requesterName}</p>}
          {description && !displayTitle.includes(description) && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${displayAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {displayAmount >= 0 ? '' : '-'}{currencySymbol}{Math.abs(displayAmount).toFixed(2)}
        </p>
        <p className="text-sm text-gray-400">
          {new Date(displayDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
} 