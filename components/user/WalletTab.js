import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Clock, 
  Calendar, Filter, ChevronRight, Loader2, CreditCard, 
  Music, RefreshCcw, History
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";
import { TopUpModal } from "./TopUpModal.jsx";
import { useSession } from "next-auth/react";


export function WalletTab() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionType, setTransactionType] = useState("all");
  const { 
    formatCurrency
  } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch wallet balance and transaction history
  const fetchWalletData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsRefreshing(true);
      
      // Fetch wallet balance
      const balanceResponse = await fetch('/api/wallet/balance');
      if (!balanceResponse.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance);
      
      // Fetch transaction history
      const transactionsResponse = await fetch('/api/wallet/transactions?limit=5');
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData.transactions || []);
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Could not load wallet data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session?.user?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchWalletData();
  }, [session?.user?.id, fetchWalletData]);
  
  // Refresh wallet data
  const handleRefresh = () => {
    fetchWalletData();
    toast.success('Wallet data refreshed');
  };

  // Fetch transactions when page or filter changes
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      const typeParam = transactionType !== "all" ? `&type=${transactionType}` : '';
      const response = await fetch(`/api/user/transactions?page=${currentPage}&limit=5${typeParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentPage, transactionType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTopUpComplete = (newBalance) => {
    setBalance(newBalance);
    setShowTopUpModal(false);
    toast.success("Your account was successfully topped up!");
    // Refresh transactions to show the new top-up
    fetchTransactions();
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
        return <ArrowUpCircle className="h-5 w-5 text-green-400" />;
      case 'withdraw':
        return <ArrowDownCircle className="h-5 w-5 text-red-400" />;
      case 'tip':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      case 'request':
        return <Music className="h-5 w-5 text-purple-400" />;
      case 'bid':
        return <Music className="h-5 w-5 text-indigo-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const getTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case 'topup':
        return `Account Top-up (${transaction.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'})`;
      case 'withdraw':
        return 'Withdrawal to Bank Account';
      case 'tip':
        return transaction.djName ? `Tip to ${transaction.djName}` : 'Tip to DJ';
      case 'request':
        return transaction.songTitle ? `Song Request: "${transaction.songTitle}"` : 'Song Request';
      case 'bid':
        return transaction.songTitle ? `Song Bid: "${transaction.songTitle}"` : 'Song Bid';
      default:
        return 'Transaction';
    }
  };
  
  const handleFilterChange = (type) => {
    setTransactionType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Wallet & Payments
        </h1>
        <button
          onClick={() => setShowTopUpModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Top Up
        </button>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl border border-blue-500/20 p-6"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-200">Wallet Balance</h3>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? (
                  <span className="inline-block w-24 h-8 bg-gray-700 rounded animate-pulse"></span>
                ) : (
                  formatCurrency(balance)
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`h-5 w-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-lg py-3 px-4 text-white font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Top Up
          </button>
          
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 px-4 text-white font-medium transition-colors"
          >
            <History className="h-5 w-5" />
            View All
          </button>
        </div>
      </motion.div>
      
      {/* Transaction History */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Transaction History
            </h3>
            
            {/* Transaction Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={transactionType}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-gray-700 text-gray-200 text-sm rounded-md px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Transactions</option>
                <option value="topup">Top Ups</option>
                <option value="tip">Tips to DJs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="divide-y divide-gray-700">
          {isLoadingTransactions ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin mr-3" />
              <span className="text-gray-400">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400 mb-2">No transactions found</p>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="mt-2 inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Funds
              </button>
            </div>
          ) : (
            <>
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-700 mr-3">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-200">
                            {getTransactionDescription(transaction)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'topup' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'topup' ? '+' : '-'} 
                            {formatCurrency(transaction.amount, transaction.currencyCode)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {transaction.status === 'completed' ? 'Completed' : transaction.status}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-gray-500 ml-2" />
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-700">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Top Up Modal */}
      <TopUpModal 
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onComplete={handleTopUpComplete}
        currentBalance={balance}
      />
    </motion.div>
  );
} 