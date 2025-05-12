import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, Loader2, Music, ChevronRight, Wallet } from "lucide-react";
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
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);

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

  // Fetch wallet balance separately to ensure consistency with the modal
  const fetchWalletBalance = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/dj/${session.user.id}/wallet`);
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWalletBalance(data.wallet.balance);
      setPendingEarnings(data.wallet.pendingEarnings || 0);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEarnings();
      fetchWalletBalance();
    }
  }, [fetchEarnings, fetchWalletBalance, session?.user?.id]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 rounded-xl p-6 shadow-lg overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white">Your Earnings</h2>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
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
          
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            disabled={isLoading || !earnings?.recentTransactions?.length}
          >
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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

          <div className="mt-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-5 border border-blue-500/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Ready to withdraw your earnings?</h3>
                <div className="flex items-center gap-2 text-sm text-blue-200/70">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span>Available balance: <span className="font-semibold text-white">{formatCurrency(walletBalance)}</span></span>
                  {pendingEarnings > 0 && (
                    <span className="text-green-400 text-xs ml-2">
                      (+{formatCurrency(pendingEarnings)} pending)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                disabled={isLoading || walletBalance <= 0}
                className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-800/50 disabled:to-indigo-800/50
                         disabled:text-blue-100/50 text-white px-6 py-3 rounded-lg font-medium 
                         transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100
                         shadow-lg hover:shadow-blue-500/25"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 
                               transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <DollarSign className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Withdraw Funds</span>
                <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
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
      
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        defaultCurrency={defaultCurrency}
        onWithdrawalComplete={() => {
          fetchEarnings();
          fetchWalletBalance();
          setShowWithdrawalModal(false);
          toast.success("Withdrawal request submitted successfully");
        }}
      />
    </motion.div>
  );
}

// StatCard component with improved mobile responsiveness
function StatCard({ title, value, icon: Icon, trend, subtitle }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="bg-gray-700/50 p-2 rounded-lg">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-semibold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      {trend !== undefined && (
        <div className="flex items-center mt-2">
          <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs font-medium">{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
          <span className="text-xs text-gray-400 ml-2">vs previous period</span>
        </div>
      )}
    </div>
  );
}

// TransactionRow component with improved mobile responsiveness
function TransactionRow({ description, amount, createdAt, date, songTitle, requesterName, currencySymbol = '$' }) {
  const displayAmount = parseFloat(amount || 0);
  const displayDate = date || createdAt;
  const displayTitle = songTitle || description?.replace('Accepted song request: ', '') || 'Transaction';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${displayAmount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} mr-3`}>
          <DollarSign className={`h-4 w-4 ${displayAmount >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <div>
          <p className="font-medium text-sm md:text-base text-white">{displayTitle}</p>
          <p className="text-xs text-gray-400">
            {requesterName ? `From ${requesterName}` : 'System transaction'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${displayAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {displayAmount >= 0 ? '' : '-'}{currencySymbol}{Math.abs(displayAmount).toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(displayDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
} 