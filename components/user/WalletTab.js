import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Clock, 
  Calendar, Filter,  Loader2, CreditCard, 
  Music, RefreshCcw, History,  
  ChevronLeft, ChevronRight, Circle, Hash, CheckCircle, XCircle, 
  RepeatIcon, ChevronDown, AlertTriangle
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";
import { TopUpModal } from "./TopUpModal.jsx";
import { useSession } from "next-auth/react";
import 'tailwindcss/tailwind.css';

const convertToCSV = (transactions) => {
  // Headers for the CSV
  const headers = ["Date", "Time", "Type", "Description", "Amount", "Status"];
  let csvContent = headers.join(",") + "\n";
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format amount with + or -
    const isPositive = transaction.type === 'topup' || transaction.type === 'refund';
    const amountPrefix = isPositive ? '+' : '-';
    const displayAmount = Math.abs(transaction.amount);
    const formattedAmount = `${amountPrefix}${displayAmount}`;
    
    const row = [
      formattedDate,
      formattedTime,
      transaction.type,
      transaction.description || "",
      formattedAmount,
      transaction.status
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",");
    
    csvContent += row + "\n";
  });
  
  return csvContent;
};

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
  const [fetchAll, setFetchAll] = useState(false);
  const { 
    formatCurrency
  } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [itemsPerPage] = useState(10);
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());
  const [isExporting, setIsExporting] = useState(false);
  
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
      showBannerToast('Could not load wallet data', 'error');
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
    showBannerToast('Wallet data refreshed');
  };

  // Fetch transactions when page or filter changes
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      
      // Make the API request
      const response = await fetch(
        `/api/user/transactions?page=${currentPage}&limit=${itemsPerPage}&type=${transactionType}&all=${fetchAll}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      
      // Update state with the response data
      setAllTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentPage, itemsPerPage, transactionType, fetchAll]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, transactionType, fetchAll, fetchTransactions]);

  // Initial data fetch for transactions when user ID is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
    }
  }, [session?.user?.id, fetchTransactions]);

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
  
  const handleFilterChange = (newType) => {
    setTransactionType(newType);
    setCurrentPage(1); // Reset to page 1 when filter changes
    // We'll let the useEffect trigger the fetch
  };

  const checkPaymentStatus = useCallback(async (checkoutRequestId) => {
    try {
      setCheckingPayment(true);
      
      const response = await fetch(`/api/payments/mpesa/check/${checkoutRequestId}`);
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      
      const data = await response.json();
      
      // Immediately update the transaction in the UI
      if (data.status === 'completed') {
        // Find and update the transaction in the local state
        setAllTransactions(prev => 
          prev.map(tx => 
            tx.details?.checkoutRequestId === checkoutRequestId
              ? { ...tx, status: 'completed' }
              : tx
          )
        );
        
        // Show success message
        toast.success('Payment confirmed successfully!');
        
        // Refresh wallet data to show updated balance
        fetchWalletData();
      } else if (data.status === 'failed') {
        // Update failed status in UI
        setAllTransactions(prev => 
          prev.map(tx => 
            tx.details?.checkoutRequestId === checkoutRequestId
              ? { ...tx, status: 'failed', failureReason: data.failureReason }
              : tx
          )
        );
        
        toast.error(`Payment failed: ${data.failureReason || 'Unknown error'}`);
      }
      
      return data.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Failed to check payment status');
      return null;
    } finally {
      setCheckingPayment(false);
    }
  }, [fetchWalletData]);

  const checkAllPendingTransactions = useCallback(async () => {
    // Find transactions with pending status
    const pendingTxs = allTransactions.filter(tx => 
      tx.status?.toLowerCase() === 'pending' && 
      tx.details?.checkoutRequestId
    );
    
    if (pendingTxs.length === 0) return;
    
    setCheckingAllPending(true);
    setLastCheckedTime(new Date());
    
    // Show a toast notification that we're checking
    toast.loading(`Checking ${pendingTxs.length} pending transactions...`, {
      id: 'checking-pending-transactions'
    });
    
    try {
      // Process each pending transaction sequentially
      for (const tx of pendingTxs) {
        await checkPaymentStatus(tx.details.checkoutRequestId);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Show success toast
      toast.success(`Checked ${pendingTxs.length} pending transactions`, {
        id: 'checking-pending-transactions'
      });
      
      // Refresh data after checking all
      fetchTransactions();
      fetchWalletData();
    } catch (error) {
      console.error('Error checking pending transactions:', error);
      toast.error('Failed to check some transactions', {
        id: 'checking-pending-transactions'
      });
    } finally {
      setCheckingAllPending(false);
    }
  }, [allTransactions, checkPaymentStatus, fetchTransactions, fetchWalletData]);

  // Find pending transactions and update effect that's causing the warning
  useEffect(() => {
    // Find pending transactions that need checking
    if (!session?.user?.id) return;
    
    const hasPendingTxs = allTransactions.some(tx => 
      tx.status?.toLowerCase() === 'pending' && 
      tx.details?.checkoutRequestId
    );
    
    if (!hasPendingTxs) return;
    
    // Set up interval to check pending transactions every 30 seconds
    const intervalId = setInterval(() => {
      // Call check function here
      checkAllPendingTransactions();
    }, 30000); // 30 seconds
    
    // Check immediately on first load
    if (!lastCheckedTime) {
      checkAllPendingTransactions();
    }
    
    return () => clearInterval(intervalId);
  }, [
    session?.user?.id, 
    allTransactions, 
    lastCheckedTime, 
    checkAllPendingTransactions
  ]);

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

  // Add this function to manually expire a specific transaction
  const handleExpireTransaction = async (checkoutRequestId) => {
    try {
      setCheckingPayment(true);
      
      console.log('Expiring transaction:', checkoutRequestId);
      
      // Check if the API endpoint exists
      if (!checkoutRequestId) {
        toast.error("No transaction ID to cancel");
        return;
      }
      
      const response = await fetch('/api/payments/mpesa/expire-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: checkoutRequestId
        })
      });
      
      // Handle response
      if (response.ok) {
        const data = await response.json();
        console.log('Transaction cancel response:', data);
        
        toast.success("Transaction marked as failed");
        fetchWalletData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        toast.error(`Could not cancel: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error expiring transaction:", error);
      toast.error("Failed to cancel transaction");
    } finally {
      setCheckingPayment(false);
    }
  };

  // Helper function to determine if a pending transaction has been waiting too long
  const isPendingTooLong = (createdAtString) => {
    const createdAt = new Date(createdAtString).getTime();
    const currentTime = Date.now();
    const fifteenMinutesMs = 15 * 60 * 1000;
    
    return (currentTime - createdAt) > fifteenMinutesMs;
  };

  // Helper function to get transaction status type
  const getTransactionStatusType = (transaction) => {
    const status = (transaction.status || 'pending').toLowerCase();
    return status;
  };

  // Helper function to get transaction icon background
  const getTransactionIconBackground = (type) => {
    switch (type) {
      case 'topup':
        return 'bg-green-500/10 text-green-400';
      case 'withdraw':
        return 'bg-red-500/10 text-red-400';
      case 'tip':
        return 'bg-blue-500/10 text-blue-400';
      case 'request':
        return 'bg-purple-500/10 text-purple-400';
      case 'bid':
        return 'bg-indigo-500/10 text-indigo-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  // Modified getStatusBadge function
  const getStatusBadge = (transaction) => {
    const status = getTransactionStatus(transaction);
    
    switch (status.text.toLowerCase()) {
      case 'completed':
        return (
          <span className={`inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium ${status.color} border border-green-500/20`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            {status.text}
          </span>
        );
      case 'pending':
        return (
          <span className={`inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium ${status.color} border border-yellow-500/20`}>
            <Clock className="h-3 w-3 mr-1" />
            {status.text}
          </span>
        );
      case 'failed':
        return (
          <span className={`inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium ${status.color} border border-red-500/20`}>
            <XCircle className="h-3 w-3 mr-1" />
            {status.text}
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium ${status.color} border border-gray-500/20`}>
            {status.text}
          </span>
        );
    }
  };

  // Combined transactions list
  useEffect(() => {
    // Combine regular and pending transactions into a single list
    const combined = [...transactions];
    
    // Only add pending transactions that aren't already in the transactions list
    pendingTransactions.forEach(pendingTx => {
      const exists = combined.some(tx => 
        tx.details?.checkoutRequestId === pendingTx.checkoutRequestId
      );
      
      if (!exists) {
        combined.push({
          _id: pendingTx._id || pendingTx.checkoutRequestId,
          type: 'topup',
          amount: pendingTx.amount,
          currency: pendingTx.currency || 'KES',
          paymentMethod: 'mpesa',
          status: 'pending',
          description: 'M-Pesa wallet top-up',
          details: {
            checkoutRequestId: pendingTx.checkoutRequestId
          },
          createdAt: pendingTx.createdAt
        });
      }
    });
    
    // Sort by date, newest first
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setAllTransactions(combined);
  }, [transactions, pendingTransactions]);

  const handleRetryTransaction = async (transaction) => {
    try {
      setIsSubmitting(true);
      
      // Only allow retrying M-Pesa transactions
      if (transaction.paymentMethod !== 'mpesa') {
        toast.error("Only M-Pesa transactions can be retried");
        return;
      }
      
      // Get the phone number from the original transaction
      let phoneNumber = transaction.details?.phoneNumber || '';
      if (!phoneNumber) {
        // If no phone number in details, prompt user
        phoneNumber = window.prompt("Please enter your M-Pesa phone number to retry payment:", "");
        if (!phoneNumber) return; // User cancelled
      }
      
      // Create a new payment request
      const response = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: transaction.amount,
          phoneNumber: phoneNumber,
          currency: transaction.currency || 'KES'
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to retry payment");
      }
      
      const result = await response.json();
      
      if (result.success) {
        showBannerToast("M-Pesa payment request sent. Please check your phone.");
      } else {
        showBannerToast(result.error || "Failed to process payment request", "error");
      }
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchWalletData();
      }, 5000);
      
    } catch (error) {
      console.error("Error retrying transaction:", error);
      toast.error("Failed to retry payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to show a banner toast
  const showBannerToast = (message, type = 'success') => {
    setBannerToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setBannerToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleExportTransactions = async () => {
    setIsExporting(true);
    try {
      // Fetch all transactions for export
      const response = await fetch(
        `/api/user/transactions?export=true&type=${transactionType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Process and download CSV
        const csvContent = convertToCSV(data.transactions);
        downloadCSV(csvContent, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
        
        toast.success('Export successful');
      } else {
        throw new Error('Failed to export transactions');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  // Example function to toggle fetchAll
  const handleViewAllTransactions = () => {
    setFetchAll(true);
    fetchTransactions();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
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
        className="bg-gradient-to-br from-blue-600/20 to-purple-700/20 backdrop-blur-lg rounded-xl border border-gray-700/50 p-5 shadow-lg">
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
            onClick={handleViewAllTransactions}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-3 px-4 text-white font-medium transition-colors"
          >
            <History className="h-5 w-5" />
            View All Transactions
          </button>
        </div>
      </motion.div>
      
      {/* Transaction History - Modern Redesign */}
      <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-purple-400" />
              Transaction History
            </h3>
            
            {/* Controls for filtering, page size and export */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Transaction type filter */}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-purple-400" />
                </div>
                <select 
                  value={transactionType}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-10 py-2 bg-gray-700/50 text-gray-200 text-sm rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 backdrop-blur-md appearance-none"
                >
                  <option value="all">All Transactions</option>
                  <option value="topup">Top Ups</option>
                  <option value="request">Song Requests</option>
                  <option value="refund">Refunds</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Export button */}
              <button
                onClick={handleExportTransactions}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-sm transition-colors"
                disabled={isExporting || allTransactions.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4" />
                )}
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List - Unified with pending transactions */}
        <div className="divide-y divide-gray-800/50">
          {isLoadingTransactions ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-3" />
                <span className="text-gray-400">Loading transactions...</span>
              </div>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-gray-800/30 rounded-full p-4 inline-flex mb-4">
                <History className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No transactions found</p>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="mt-2 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </button>
            </div>
          ) : (
            <>
              {allTransactions.map((transaction, index) => {
                const statusType = getTransactionStatusType(transaction);
                const isPending = statusType === 'pending';
                const isFailed = statusType === 'failed';
                
                return (
                  <motion.div
                    key={transaction._id || transaction.checkoutRequestId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <div className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        {/* Transaction Info - Stack on mobile, side-by-side on desktop */}
                        <div className="flex items-start space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                          <div className={`rounded-full p-2.5 sm:p-3 flex-shrink-0 ${getTransactionIconBackground(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          
                          <div className="min-w-0"> {/* Prevent flex child from growing too large */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <p className="font-medium text-sm sm:text-base text-gray-200 break-words">
                                {getTransactionDescription(transaction)}
                              </p>
                              {getStatusBadge(transaction)}
                            </div>
                            
                            <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                              <span className="flex items-center flex-shrink-0">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                <span>{formatDate(transaction.createdAt)}</span>
                              </span>
                              
                              {transaction.paymentMethod && (
                                <span className="ml-2 sm:ml-3 flex items-center flex-shrink-0">
                                  <Circle className="h-1.5 w-1.5 mr-1.5" />
                                  <span>{transaction.paymentMethod.toUpperCase()}</span>
                                </span>
                              )}
                              
                              {transaction.details?.checkoutRequestId && (
                                <span className="ml-2 sm:ml-3 flex items-center flex-shrink-0 overflow-hidden">
                                  <Hash className="h-3 w-3 mr-1.5" />
                                  <span className="truncate max-w-[80px] sm:max-w-[100px]">
                                    {transaction.details.checkoutRequestId.substring(0, 8)}...
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Amount and Actions - Right aligned on larger screens, below on mobile */}
                        <div className="flex justify-between items-center sm:flex-col sm:items-end sm:space-y-2 mt-2 sm:mt-0">
                          <p className={`font-semibold text-base ${
                            transaction.type === 'topup' || transaction.type === 'refund'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {transaction.type === 'topup' || transaction.type === 'refund' 
                              ? `+${formatCurrency(transaction.amount)}`
                              : `-${formatCurrency(transaction.amount)}`}
                          </p>
                          
                          {/* Action buttons with improved styling */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 opacity-90 sm:opacity-80 group-hover:opacity-100 transition-opacity">
                            {isPending && (
                              <button
                                onClick={() => transaction.details?.checkoutRequestId && 
                                               checkPaymentStatus(transaction.details.checkoutRequestId)}
                                disabled={checkingPayment}
                                className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 
                                         transition-colors duration-200 flex items-center space-x-1 border border-blue-500/20"
                              >
                                {checkingPayment ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Checking...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCcw className="h-3 w-3" />
                                    <span>Check Status</span>
                                  </>
                                )}
                              </button>
                            )}
                            
                            {isFailed && transaction.paymentMethod === 'mpesa' && (
                              <button
                                onClick={() => handleRetryTransaction(transaction)}
                                disabled={isSubmitting}
                                className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full hover:bg-purple-500/20 
                                         transition-colors duration-200 flex items-center space-x-1 border border-purple-500/20"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <RepeatIcon className="h-3 w-3" />
                                    <span>Retry Payment</span>
                                  </>
                                )}
                              </button>
                            )}
                            
                            {isPending && isPendingTooLong(transaction.createdAt) && (
                              <button
                                onClick={() => {
                                  // Make sure we're using the right ID and the function is available
                                  if (transaction.details?.checkoutRequestId) {
                                    // Log for debugging
                                    console.log('Cancelling transaction:', transaction.details.checkoutRequestId);
                                    handleExpireTransaction(transaction.details.checkoutRequestId);
                                  } else if (transaction.checkoutRequestId) {
                                    // Alternative ID location
                                    console.log('Cancelling transaction (alt):', transaction.checkoutRequestId);
                                    handleExpireTransaction(transaction.checkoutRequestId);
                                  } else {
                                    toast.error("Cannot cancel: Missing transaction ID");
                                  }
                                }}
                                disabled={checkingPayment}
                                className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 
                                         transition-colors duration-200 flex items-center space-x-1 border border-red-500/20"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Modern Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center p-6">
                  <div className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                            currentPage === pageNum 
                              ? 'bg-purple-500 text-white font-medium' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
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

      {/* Banner Toast */}
      {bannerToast.show && (
        <div className={`fixed top-16 right-4 left-4 md:left-auto md:w-96 p-4 rounded-lg shadow-lg z-50 
                        ${bannerToast.type === 'success' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'} 
                        transform transition-all duration-300 ease-in-out`}
             style={{ animation: 'slide-in-right 0.5s ease-out' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {bannerToast.type === 'success' 
                ? <CheckCircle className="h-5 w-5 mr-2" /> 
                : <AlertTriangle className="h-5 w-5 mr-2" />}
              <p className="font-medium">{bannerToast.message}</p>
            </div>
            <button 
              onClick={() => setBannerToast({ show: false, message: '', type: '' })}
              className="ml-4 text-white/80 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Move style tag inside the return statement */}
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  );
} 