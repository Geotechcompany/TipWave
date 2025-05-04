import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  X, Loader2, Phone, CheckCircle, AlertTriangle, XCircle, Wallet, 
  CreditCard, ArrowRight 
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

  
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });

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

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/currencies/default');
        if (response.ok) {
          const data = await response.json();
          setLocalCurrency(data);
        } else {
          console.error("Failed to fetch currency, using default");
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };
    
    fetchCurrency();
  }, []);

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
        const response = await fetch('/api/payments/mpesa/stkpush', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            phone,
            storeTransaction: true,
            description: 'Wallet Top Up'
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to process payment');
        }
        
        showBannerToast('M-PESA payment initiated successfully', 'success');
        toast.success('M-PESA STK push sent to your phone. Please check your phone to complete the payment.');
        
        handleClose();
        
        if (onComplete) {
          onComplete({
            amount: parseFloat(amount),
            method: 'mpesa',
            status: 'pending',
            checkoutRequestId: data.CheckoutRequestID,
            merchantRequestId: data.MerchantRequestID,
            transactionId: data.CheckoutRequestID
          });
        }
      } else {
        toast.error('This payment method is not yet implemented');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setAmount("");
    setPhone("");
    setSelectedMethod(null);
    setIsProcessing(false);
    
    // Call the onClose callback
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-purple-400" />
            Top Up Wallet
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            {/* Current Balance */}
            <div className="mb-5 bg-gray-800/50 rounded-xl p-4">
              <div className="text-sm text-gray-400">Current Balance</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentBalance)}</div>
            </div>
            
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
                      onClick={() => setSelectedMethod(method._id)}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method._id
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                      }`}
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
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Enter the phone number registered with M-PESA
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedMethod || !amount || isProcessing || (isMpesa && !phone)}
              className="w-full flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Top Up Wallet
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Banner Toast */}
      {bannerToast.show && (
        <div className={`fixed top-16 right-4 left-4 md:left-auto md:w-96 p-4 rounded-lg shadow-lg z-[100] 
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