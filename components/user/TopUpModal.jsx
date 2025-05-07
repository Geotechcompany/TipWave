import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { 
  X, Loader2, Phone, CheckCircle, AlertTriangle, XCircle, Wallet, 
  CreditCard, ArrowRight, RefreshCcw 
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = url => fetch(url).then(res => res.json());

export function TopUpModal({ isOpen, onClose, onComplete, currentBalance }) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { formatCurrency } = useCurrency();
  
  // Toast banner state
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });

  // Payment status state with more detailed properties
  const [paymentStatus, setPaymentStatus] = useState({
    pending: false,
    checkoutRequestId: null,
    merchantRequestId: null,
    confirmed: false,
    failed: false,
    failureReason: null
  });

  // Status checking state
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // Status check interval reference (using useRef to persist between renders)
  const statusCheckIntervalRef = useRef(null);
  
  // Count failed status checks to limit retries
  const [failedChecks, setFailedChecks] = useState(0);
  const MAX_FAILED_CHECKS = 5;

  // Fetch payment methods using SWR
  const { data: paymentMethodsData, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSWR(
    isOpen ? '/api/payment-methods/active' : null, // Only fetch when modal is open
    fetcher
  );

  // Use useMemo to prevent unnecessary re-renders
  const paymentMethods = useMemo(() => 
    paymentMethodsData?.paymentMethods || [],
    [paymentMethodsData]
  );

  // Set default payment method when data loads
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0]._id);
    }
  }, [paymentMethods, selectedMethod]);

  // Get the selected payment method object
  const selectedPaymentMethod = paymentMethods.find(m => m._id === selectedMethod);
  const isMpesa = selectedPaymentMethod?.code === 'mpesa';

  // Clean up interval on unmount and when modal closes
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Also clean up when modal is not open
  useEffect(() => {
    if (!isOpen && statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  }, [isOpen]);

  // Show a toast banner
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

  // Function to check payment status
  const checkPaymentStatus = useCallback(async (checkoutRequestId) => {
    if (!checkoutRequestId || checkingStatus) return;
    
    setCheckingStatus(true);
    
    try {
      const response = await fetch(`/api/payments/mpesa/confirm?transactionId=${checkoutRequestId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      
      const data = await response.json();
      
      if (data.status === "COMPLETED") {
        // Payment successful
        setPaymentStatus(prev => ({
          ...prev,
          confirmed: true,
          pending: false
        }));
        
        showBannerToast('Payment successful! Your wallet has been topped up.', 'success');
        toast.success('Payment successful!');
        
        // Reset failed checks
        setFailedChecks(0);
        
        // Clear interval as we don't need to check anymore
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete({
            amount: parseFloat(amount),
            method: 'mpesa',
            status: 'completed',
            transactionId: checkoutRequestId
          });
        }
      } else if (data.status === "FAILED") {
        // Payment failed
        setPaymentStatus(prev => ({
          ...prev,
          failed: true,
          pending: false,
          failureReason: data.data?.ResultDesc || 'Payment failed'
        }));
        
        showBannerToast('Payment failed. Please try again.', 'error');
        toast.error('Payment failed');
        
        // Clear interval as we don't need to check anymore
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      } else {
        // Still pending
        console.log('Payment still pending, will check again');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      
      // Increment failed checks
      setFailedChecks(prev => prev + 1);
      
      // If we've failed too many times, stop checking
      if (failedChecks >= MAX_FAILED_CHECKS) {
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        showBannerToast('There was a problem checking your payment status. Please try again later.', 'error');
      }
    } finally {
      setCheckingStatus(false);
    }
  }, [checkingStatus, amount, onComplete, failedChecks]);

  // Set up automatic status checking
  const startPaymentStatusCheck = useCallback((checkoutRequestId) => {
    // Clear any existing interval first
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    
    // Reset failed checks
    setFailedChecks(0);
    
    // Check immediately
    checkPaymentStatus(checkoutRequestId);
    
    // Then check every 5 seconds
    statusCheckIntervalRef.current = setInterval(() => {
      checkPaymentStatus(checkoutRequestId);
    }, 5000);
    
    // Set a timeout to stop checking after 2 minutes (24 checks)
    setTimeout(() => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
        
        // If still pending after 2 minutes, show a message
        setPaymentStatus(prev => {
          if (prev.pending && !prev.confirmed) {
            showBannerToast(
              'Your payment is taking longer than expected. You can close this dialog and check your wallet later.',
              'info'
            );
            return prev;
          }
          return prev;
        });
      }
    }, 120000); // 2 minutes
  }, [checkPaymentStatus]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (isMpesa && !phone) {
      toast.error("Please enter your phone number");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      if (isMpesa) {
        // Make sure phone number has proper format (254XXXXXXXXX)
        // Remove any spaces, dashes or other characters
        const formattedPhone = phone.replace(/\D/g, '');
        
        // Make sure it starts with country code (254 for Kenya)
        const phoneWithCountryCode = formattedPhone.startsWith('254') 
          ? formattedPhone 
          : formattedPhone.startsWith('0') 
            ? `254${formattedPhone.substring(1)}` 
            : `254${formattedPhone}`;
        
        console.log('Sending payment request with phone:', phoneWithCountryCode, 'amount:', amount);
        
        const response = await fetch('/api/payments/mpesa/stkpush', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phoneWithCountryCode,
            amount: parseFloat(amount),
            // Include any other required fields
            description: 'Wallet top-up',
            accountReference: 'Wallet',
            // Add any other fields required by your API
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment processing failed');
        }
        
        const data = await response.json();
        
        showBannerToast('M-PESA payment initiated. Check your phone to complete the transaction.', 'success');
        toast.success('M-PESA STK push sent to your phone. Please check your phone to complete the payment.');
        
        // Update payment status to show pending state
        setPaymentStatus({
          pending: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          confirmed: false,
          failed: false,
          failureReason: null
        });
        
        // Start checking payment status
        startPaymentStatusCheck(data.CheckoutRequestID);
      } else {
        toast.error('This payment method is not yet implemented');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle manual cancellation
  const handleCancelPayment = async () => {
    if (!paymentStatus.checkoutRequestId) return;
    
    try {
      // Clear status check interval
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      
      // Call API to mark transaction as expired/cancelled
      const response = await fetch('/api/payments/mpesa/expire-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: paymentStatus.checkoutRequestId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }
      
      // Reset payment status
      setPaymentStatus({
        pending: false,
        checkoutRequestId: null,
        merchantRequestId: null,
        confirmed: false,
        failed: false,
        failureReason: null
      });
      
      showBannerToast('Payment cancelled successfully.', 'success');
      toast.success('Payment cancelled');
      
      // Reset form if needed
      setAmount("");
      setPhone("");
    } catch (error) {
      console.error('Error cancelling payment:', error);
      toast.error(error.message || 'Failed to cancel payment');
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Don't close if there's a payment in progress that's not confirmed or failed
    if (paymentStatus.pending && !paymentStatus.confirmed && !paymentStatus.failed) {
      showBannerToast("Please wait for the payment to complete or cancel it", "error");
      return;
    }
    
    // Clean up
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
    
    // Reset form state
    setAmount("");
    setPhone("");
    setSelectedMethod(null);
    setIsProcessing(false);
    setPaymentStatus({
      pending: false,
      checkoutRequestId: null,
      merchantRequestId: null,
      confirmed: false,
      failed: false,
      failureReason: null
    });
    
    // Call the onClose callback
    onClose();
  };

  // Handle completion (only shown after successful payment)
  const handleComplete = () => {
    if (paymentStatus.confirmed) {
      handleClose();
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <motion.div 
        className="relative w-full max-w-md mx-auto bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            disabled={paymentStatus.pending && !paymentStatus.confirmed && !paymentStatus.failed}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-purple-500/20 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Top Up Wallet</h2>
          </div>
          
          {currentBalance !== undefined && (
            <div className="mb-5 p-3 bg-gray-800/60 rounded-lg">
              <p className="text-sm text-gray-400">Current Balance</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(currentBalance)}
              </p>
            </div>
          )}
          
          {paymentStatus.failed && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-200">Payment Failed</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {paymentStatus.failureReason || "Your payment could not be processed. Please try again."}
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStatus({
                        pending: false,
                        checkoutRequestId: null,
                        merchantRequestId: null,
                        confirmed: false,
                        failed: false,
                        failureReason: null
                      });
                    }}
                    className="mt-2 text-xs flex items-center bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Top Up
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="any"
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={paymentStatus.pending}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">KES</span>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              
              {paymentMethodsLoading ? (
                <div className="flex items-center justify-center py-4 bg-gray-800/50 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-400 mr-2" />
                  <span className="text-gray-400">Loading payment methods...</span>
                </div>
              ) : paymentMethodsError ? (
                <div className="flex items-center py-4 px-3 bg-red-500/10 text-red-400 rounded-lg">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>Failed to load payment methods</span>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="flex items-center py-4 px-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>No payment methods available</span>
                </div>
              ) : (
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method._id}
                      onClick={() => !paymentStatus.pending && setSelectedMethod(method._id)}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method._id
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                      } ${paymentStatus.pending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        {method.icon ? (
                          <img src={method.icon} alt={method.name} className="h-6 w-6" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{method.name}</div>
                        <div className="text-xs text-gray-400">{method.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Phone Input for M-PESA */}
            {isMpesa && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  M-PESA Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={paymentStatus.pending}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Enter the phone number registered with M-PESA
                </p>
              </div>
            )}
            
            {/* Payment status indicator */}
            {paymentStatus.pending && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {paymentStatus.confirmed ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200">
                      {paymentStatus.confirmed ? 'Payment Confirmed' : 'Payment Pending'}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {paymentStatus.confirmed 
                        ? 'Your payment has been confirmed. Your wallet has been topped up.' 
                        : 'Please complete the payment on your phone. This window will update automatically when payment is confirmed.'}
                    </p>
                    
                    <div className="flex flex-wrap mt-3 gap-2">
                      {!paymentStatus.confirmed && (
                        <>
                          <button
                            onClick={() => checkPaymentStatus(paymentStatus.checkoutRequestId)}
                            disabled={checkingStatus}
                            className="text-xs flex items-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-1.5 px-3 rounded transition-colors disabled:opacity-50"
                          >
                            {checkingStatus ? (
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
                          
                          <button
                            onClick={handleCancelPayment}
                            className="text-xs flex items-center bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1.5 px-3 rounded transition-colors"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            <span>Cancel Payment</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit/Complete Button */}
            {paymentStatus.confirmed ? (
              <button
                type="button"
                onClick={handleComplete}
                className="w-full mt-5 flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  !selectedMethod || 
                  !amount || 
                  isProcessing || 
                  (isMpesa && !phone) || 
                  paymentStatus.pending
                }
                className="w-full mt-5 flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : paymentStatus.pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Waiting for confirmation...
                  </>
                ) : (
                  <>
                    Top Up Wallet
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </motion.div>

      {/* Banner Toast */}
      {bannerToast.show && (
        <div className={`fixed top-16 right-4 left-4 md:left-auto md:w-96 p-4 rounded-lg shadow-lg z-[100] 
                       ${bannerToast.type === 'success' 
                          ? 'bg-green-600 text-white' 
                          : bannerToast.type === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white'} 
                       transform transition-all duration-300 ease-in-out`}
             style={{ animation: 'slide-in-right 0.5s ease-out' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {bannerToast.type === 'success' 
                ? <CheckCircle className="h-5 w-5 mr-2" /> 
                : bannerToast.type === 'error'
                  ? <AlertTriangle className="h-5 w-5 mr-2" />
                  : <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
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

      {/* Add CSS for animation */}
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
    </div>
  );
} 