import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Clock, 
  Calendar, Filter, ChevronRight, Download, Loader2, CreditCard, 
  Info
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";
import { TopUpModal } from "./TopUpModal";

export function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionType, setTransactionType] = useState("all");
  const { formatCurrency, defaultCurrency } = useCurrency();
  
  // Fetch user balance on component mount
  useEffect(() => {
    fetchUserBalance();
  }, []);
  
  // Fetch transactions when page or filter changes
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, transactionType]);

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await fetch("/api/user/balance");
      
      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }
      
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to load your account balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const typeParam = transactionType !== "all" ? `&type=${transactionType}` : '';
      const response = await fetch(`/api/user/transactions?page=${currentPage}&limit=5${typeParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

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
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Account Balance
          </h3>
        </div>
        
        <div className="flex items-baseline">
          {isLoadingBalance ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-300" />
              <span className="text-gray-200">Loading balance...</span>
            </div>
          ) : (
            <>
              <span className="text-3xl font-bold text-white">
                {formatCurrency(balance)}
              </span>
              <span className="ml-2 text-blue-200">{defaultCurrency.code}</span>
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Top Up
          </button>
          
          <button
            className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            onClick={() => toast("Withdraw functionality coming soon!")}
          >
            <Download className="h-4 w-4 mr-1" />
            Withdraw
          </button>
        </div>
      </div>
      
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