import { useState, useEffect, useCallback } from 'react';
import { 
  X, AlertCircle, Loader2, CheckCircle, 
  Clock, DollarSign, Wallet, ChevronRight 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function WithdrawalModal({ isOpen, onClose, defaultCurrency, onWithdrawalComplete }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('amount'); // 'amount' or 'confirm'
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setAmount('');
      if (session?.user?.id) {
        fetchWithdrawalMethods();
        fetchWalletBalance();
      }
    }
  }, [isOpen, session?.user?.id, fetchWithdrawalMethods, fetchWalletBalance]);
  
  const fetchWithdrawalMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods`);
      
      if (!response.ok) throw new Error('Failed to fetch withdrawal methods');
      
      const data = await response.json();
      setWithdrawalMethods(data.methods || []);
      
      // Select default withdrawal method if any
      const defaultMethod = data.methods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedMethodId(defaultMethod._id);
      } else if (data.methods.length > 0) {
        setSelectedMethodId(data.methods[0]._id);
      }
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      toast.error('Failed to load withdrawal methods');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/dj/${session.user.id}/wallet`);
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWalletBalance(data.wallet.balance);
      setPendingEarnings(data.wallet.pendingEarnings || 0);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to load balance");
    }
  }, [session?.user?.id]);

  const handleNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > walletBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }

    if (!selectedMethodId) {
      toast.error('Please select a withdrawal method');
      return;
    }

    setStep('confirm');
  };
  
  const handleWithdraw = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/dj/${session.user.id}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          withdrawalMethodId: selectedMethodId,
          currency: defaultCurrency.code
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      // Show success notification with more details
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-100">
                  Withdrawal Request Submitted
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Amount: {defaultCurrency.symbol}{parseFloat(amount).toFixed(2)}
                  <br />
                  Status: Pending Approval
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      });

      // Call the completion handler and close modal
      onWithdrawalComplete?.();
      onClose();

    } catch (error) {
      console.error('Error processing withdrawal:', error);
      // Show error notification with more details
      toast.error(error.message || 'Failed to process withdrawal', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#1F2937',
          color: '#fff',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMethod = withdrawalMethods.find(m => m._id === selectedMethodId);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 rounded-xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-lg">Withdraw Funds</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Loading withdrawal methods...</p>
              </div>
            ) : withdrawalMethods.length === 0 ? (
              /* No Methods State */
              <div className="text-center py-8">
                <div className="bg-amber-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No withdrawal methods found</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Please add a withdrawal method in your settings before withdrawing.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Main Content */
              <div className="space-y-6">
                {/* Balance Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Available Balance
                  </label>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    {defaultCurrency.symbol}{walletBalance.toFixed(2)}
                  </div>
                </div>

                {step === 'amount' ? (
                  /* Amount Step */
                  <>
                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Available Balance</span>
                          <span className="text-lg font-medium">
                            {defaultCurrency.symbol}{walletBalance.toFixed(2)}
                          </span>
                        </div>
                        {pendingEarnings > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-400">Pending Earnings</span>
                            <span className="text-green-400">
                              +{defaultCurrency.symbol}{pendingEarnings.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Amount Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount to Withdraw
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {defaultCurrency.symbol}
                          </span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-8
                                      text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                      focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            max={walletBalance}
                          />
                        </div>
                      </div>

                      {/* Withdrawal Method Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Select Withdrawal Method
                        </label>
                        <div className="space-y-2">
                          {withdrawalMethods.map((method) => (
                            <button
                              key={method._id}
                              onClick={() => setSelectedMethodId(method._id)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                selectedMethodId === method._id
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  selectedMethodId === method._id
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-500'
                                }`} />
                                <div className="text-left">
                                  <div className="font-medium">
                                    {method.accountName}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {method.accountNumber}
                                  </div>
                                </div>
                              </div>
                              {method.isDefault && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleNext}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white 
                                 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Confirmation Step */
                  <>
                    <ProcessingNotice />
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount</span>
                        <span className="font-medium text-white">
                          {defaultCurrency.symbol}{parseFloat(amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Method</span>
                        <span className="font-medium text-white">
                          {selectedMethod?.accountName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Account</span>
                        <span className="font-medium text-white">
                          {selectedMethod?.accountNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('amount')}
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg 
                                 text-gray-300 font-medium transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleWithdraw}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white 
                                 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Confirm Withdrawal
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Add a processing notice component
const ProcessingNotice = () => (
  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
    <div className="flex items-start gap-3">
      <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
      <div>
        <h4 className="text-sm font-medium text-amber-400 mb-1">
          Processing Information
        </h4>
        <p className="text-xs text-gray-400 mt-1">
          You&apos;ll receive a notification once approved
        </p>
      </div>
    </div>
  </div>
); 