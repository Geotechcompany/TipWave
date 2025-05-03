import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Phone, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";

export function TopUpModal({ isOpen, onClose, onComplete, currentBalance }) {
  const [amount, setAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    formatCurrency, 
  } = useCurrency();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [localCurrency, setLocalCurrency] = useState({ 
    code: 'KES', 
    symbol: 'Ksh',
    name: 'Kenyan Shilling'
  });
  const [isVerifying, setIsVerifying] = useState(false);
  /**
   * Stores the transaction ID from M-Pesa for tracking/receipt purposes 
   * (currently only set, future implementation will use this for transaction lookup)
   */
  const [_transactionId, setTransactionId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [verificationInterval, setVerificationInterval] = useState(null);
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });

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

  useEffect(() => {
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [verificationInterval]);

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
    
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Validate phone number
    if (!phoneNumber) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Always use M-Pesa endpoint
      const endpoint = '/api/payments/mpesa/stkpush';
      const body = { 
        amount, 
        phone: phoneNumber,
        currency: localCurrency.code
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error("Payment failed");
      }
      
      const data = await response.json();
      
      // Process M-Pesa payment
      setTransactionId(data.CheckoutRequestID);
      console.log(`M-Pesa transaction reference: ${data.CheckoutRequestID}`);
      showBannerToast("M-Pesa request sent. Please check your phone to complete payment.");
      setIsVerifying(true);
      
      // Poll for payment confirmation
      verifyMpesaPayment(data.CheckoutRequestID);
    } catch (error) {
      console.error("Error processing payment:", error);
      showBannerToast("Payment failed. Please try again.", "error");
      setIsSubmitting(false);
    }
  };
  
  const verifyMpesaPayment = async (CheckoutRequestID) => {
    // Reset attempts counter when starting verification
    setAttempts(0);
    let localAttempts = 0;
    const maxAttempts = 10;
    
    const intervalId = setInterval(async () => {
      try {
        localAttempts++;
        setAttempts(localAttempts); // Update state with current attempt count
        
        const response = await fetch(`/api/payments/mpesa/confirm/${CheckoutRequestID}`);
        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }
        
        const data = await response.json();
        
        // If payment is completed or failed, close the modal and notify
        if (data.status === "COMPLETED") {
          clearInterval(intervalId);
          setIsVerifying(false);
          setIsSubmitting(false);
          
          // Send the data to parent component
          onComplete(data);
          
          // Close modal immediately
          onClose();
          
          // Show success message
          showBannerToast("Payment completed successfully! Your balance has been updated.");
          return;
        } 
        
        if (data.status === "FAILED") {
          clearInterval(intervalId);
          setIsVerifying(false);
          setIsSubmitting(false);
          
          // Send failure info to parent
          onComplete(data);
          
          // Close modal
          onClose();
          
          // Show error message
          showBannerToast("Payment failed. Please try again.", "error");
          return;
        }
        
        // If we've reached max attempts, stop polling but allow user to close manually
        if (localAttempts >= maxAttempts) {
          clearInterval(intervalId);
          setIsVerifying(false);
          
          // Update UI to show "Check status later" button instead of spinner
          setIsSubmitting(false);
          showBannerToast("Payment is still processing. You can close this window and check your account later.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        
        // On error after several attempts, allow user to close modal
        if (localAttempts >= 3) {
          setIsVerifying(false);
          showBannerToast("Couldn't verify payment status. Please check your account later.", "error");
        }
      }
    }, 5000); // Check every 5 seconds
    
    // Save interval ID to state so we can clear it if user closes modal manually
    setVerificationInterval(intervalId);
  };

  // JSX - adding M-Pesa option
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Top Up Your Account</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Current Balance</label>
                <div className="text-2xl font-bold flex items-center">
                  <span className="opacity-70 mr-1">{localCurrency.symbol}</span>
                  {formatCurrency(currentBalance || 0, false)}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-sm">Amount to Add</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">{localCurrency.symbol}</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    className="bg-gray-800 border border-gray-700 pl-10 pr-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {/* Show phone number input when M-Pesa is selected */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">M-Pesa Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 254712345678"
                    className="bg-gray-800 border border-gray-700 pl-10 pr-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter your phone number with country code (254)</p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Top Up {localCurrency.symbol}{amount.toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* Add a cancel button when verifying for too long */}
              {isVerifying && attempts > 5 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  Check Status Later
                </button>
              )}
            </form>

            {/* Show transaction reference in verifying state */}
            {isVerifying && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-400">Transaction Reference:</p>
                <p className="font-mono text-xs">{_transactionId}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

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
    </AnimatePresence>
  );
} 