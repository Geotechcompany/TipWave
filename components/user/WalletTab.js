import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Clock, 
  Calendar, Filter,  Loader2, CreditCard, 
  Music, RefreshCcw, History, Badge
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
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  
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
      
      // Add this code to fetch pending transactions
      const pendingResponse = await fetch('/api/payments/mpesa/pending');
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingTransactions(pendingData.transactions || []);
      }
      
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
      
      // Get regular transactions
      const response = await fetch(`/api/user/transactions?page=${currentPage}&limit=5${typeParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      let allTransactions = data.transactions || [];
      
      // Get pending transactions if we're looking at all or topup transactions
      if (transactionType === "all" || transactionType === "topup") {
        const pendingResponse = await fetch(`/api/payments/mpesa/pending`);
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          
          // Format pending transactions to match regular transactions
          const formattedPending = pendingData.transactions.map(pt => ({
            _id: pt._id || pt.checkoutRequestId,
            type: 'topup',
            amount: pt.amount,
            currency: pt.currency || 'KES',
            paymentMethod: 'mpesa',
            status: 'pending',
            description: 'M-Pesa wallet top-up (pending)',
            details: {
              checkoutRequestId: pt.checkoutRequestId
            },
            createdAt: pt.createdAt
          }));
          
          // Combine and sort all transactions by date
          allTransactions = [...allTransactions, ...formattedPending]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      }
      
      setTransactions(allTransactions || []);
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

  const handleTopUpComplete = (data) => {
    if (data?.CheckoutRequestID) {
      toast.success("M-Pesa payment initiated. Checking status...");
      
      setTimeout(() => {
        checkPaymentStatus(data.CheckoutRequestID);
      }, 5000);
    }
    
    setShowTopUpModal(false);
    fetchWalletData();
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
    const isPending = (transaction.status || '').toLowerCase() === 'pending';
    const pendingText = isPending ? ' (Pending)' : '';
    
    switch (transaction.type) {
      case 'topup':
        return `Wallet top-up via ${transaction.paymentMethod || 'payment'}${pendingText}`;
      case 'withdraw':
        return `Withdrawal${pendingText}`;
      case 'tip':
        return `Tip to ${transaction.recipientName || 'creator'}${pendingText}`;
      case 'request':
        return `Song request: ${transaction.songTitle || 'Unknown'}${pendingText}`;
      case 'bid':
        return `Song bid: ${transaction.songTitle || 'Unknown'}${pendingText}`;
      default:
        return `${transaction.description || 'Transaction'}${pendingText}`;
    }
  };
  
  const handleFilterChange = (type) => {
    setTransactionType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const checkPaymentStatus = useCallback(async (checkoutRequestId) => {
    try {
      setCheckingPayment(true);
      const res = await fetch(`/api/payments/mpesa/confirm/${checkoutRequestId}`);
      if (res.ok) {
        const data = await res.json();
        
        if (data.status === "COMPLETED") {
          toast.success("Payment completed successfully!");
          fetchWalletData();
          return true;
        } else if (data.status === "FAILED") {
          toast.error("Payment failed. Please try again.");
          fetchWalletData();
          return true;
        } else {
          toast.info("Payment is still being processed. Please wait.");
        }
      }
      return false; // Still pending
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    } finally {
      setCheckingPayment(false);
    }
  }, [fetchWalletData]);

  useEffect(() => {
    // Check if there are any pending transactions
    const hasPendingTransaction = transactions.some(tx => 
      tx.status === 'pending' || 
      (tx.type === 'topup' && tx.paymentMethod === 'mpesa')
    );
    
    let intervalId;
    if (hasPendingTransaction) {
      // Poll for updates every 10 seconds if we have pending transactions
      intervalId = setInterval(() => {
        // Find pending M-Pesa transactions
        const pendingMpesa = transactions.find(tx => 
          tx.status === 'pending' && 
          tx.paymentMethod === 'mpesa' && 
          tx.details?.checkoutRequestId
        );
        
        if (pendingMpesa?.details?.checkoutRequestId) {
          checkPaymentStatus(pendingMpesa.details.checkoutRequestId);
        } else {
          fetchWalletData();
        }
      }, 10000);
    }
    
    // Also refresh when the component mounts
    fetchWalletData();
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactions, checkPaymentStatus, fetchWalletData]);

  const getTransactionStatus = (transaction) => {
    // Convert status to lowercase for consistent comparison
    const status = (transaction.status || 'pending').toLowerCase();
    
    switch (status) {
      case 'completed':
        return { text: 'Completed', color: 'text-green-500' };
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-500' };
      case 'failed':
        return { text: 'Failed', color: 'text-red-500' };
      default:
        return { text: status.charAt(0).toUpperCase() + status.slice(1), color: 'text-gray-500' };
    }
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
              {transactions.map((transaction) => {
                const status = getTransactionStatus(transaction);
                return (
                  <div key={transaction._id} className="border-b border-gray-100 dark:border-gray-800 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{getTransactionDescription(transaction)}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(transaction.createdAt)}</span>
                            
                            <span className={`ml-3 ${status.color}`}>• {status.text}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'topup' ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.type === 'topup' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        
                        {transaction.status === 'pending' && 
                         transaction.paymentMethod === 'mpesa' && 
                         transaction.details?.checkoutRequestId && (
                          <button 
                            onClick={() => checkPaymentStatus(transaction.details.checkoutRequestId)}
                            disabled={checkingPayment}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center justify-end ml-auto">
                            {checkingPayment ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                <span>Checking...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="h-3 w-3 mr-1" />
                                <span>Check Status</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
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
      
      {/* Add this after your regular transactions list */}
      {pendingTransactions.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Transactions</h3>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {pendingTransactions.length} pending
            </Badge>
          </div>
          
          <div className="space-y-2">
            {pendingTransactions.map((tx) => (
              <div key={tx._id || tx.checkoutRequestId} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <div>
                      <p className="font-medium">M-Pesa Payment (Pending)</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{tx.currency || 'KES'} {tx.amount}</p>
                    <button 
                      onClick={() => checkPaymentStatus(tx.checkoutRequestId)}
                      className="text-xs text-blue-600 hover:text-blue-800">
                      Check Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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