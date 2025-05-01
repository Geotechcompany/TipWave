import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, DollarSign, Phone } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";

export function TopUpModal({ isOpen, onClose, onComplete, currentBalance }) {
  const [amount, setAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    formatCurrency, 
  } = useCurrency();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("creditCard");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Validate phone number for M-Pesa
    if (selectedPaymentMethod === "mpesa" && !phoneNumber) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let endpoint = '/api/user/wallet/topup';
      let body = { amount, paymentMethod: selectedPaymentMethod };
      
      // If M-Pesa is selected, use the M-Pesa specific endpoint
      if (selectedPaymentMethod === "mpesa") {
        endpoint = '/api/payments/mpesa/stkpush';
        body = { 
          amount, 
          phone: phoneNumber,
          currency: localCurrency.code
        };
      }
      
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
      
      if (selectedPaymentMethod === "mpesa") {
        // For M-Pesa, we need to verify the payment
        setTransactionId(data.CheckoutRequestID);
        console.log(`M-Pesa transaction reference: ${data.CheckoutRequestID}`);
        toast.success("M-Pesa request sent. Please check your phone to complete payment.");
        setIsVerifying(true);
        
        // Poll for payment confirmation
        verifyMpesaPayment(data.CheckoutRequestID);
      } else {
        // For other payment methods
        toast.success("Payment successful!");
        onComplete(data.newBalance || amount);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      if (selectedPaymentMethod !== "mpesa") {
        setIsSubmitting(false);
      }
    }
  };
  
  const verifyMpesaPayment = async (CheckoutRequestID) => {
    // Implement polling to check payment status
    let attempts = 0;
    const maxAttempts = 10;
    const intervalId = setInterval(async () => {
      try {
        attempts++;
        
        const response = await fetch(`/api/payments/mpesa/confirm/${CheckoutRequestID}`);
        const data = await response.json();
        
        // If payment is successful
        if (data.ResultCode === "0") {
          clearInterval(intervalId);
          setIsVerifying(false);
          setIsSubmitting(false);
          
          // Fetch updated balance
          const balanceResponse = await fetch('/api/user/wallet');
          const balanceData = await balanceResponse.json();
          
          onComplete(balanceData.balance);
          toast.success("M-Pesa payment confirmed. Your balance has been updated!");
        }
        
        // If we've reached max attempts, stop polling
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setIsVerifying(false);
          setIsSubmitting(false);
          toast.error("Could not confirm M-Pesa payment. Please check your account later.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
      }
    }, 5000); // Check every 5 seconds
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
                  <DollarSign className="h-5 w-5 opacity-70 mr-1" />
                  {formatCurrency(currentBalance || 0)}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-sm">Amount to Add</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
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
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedPaymentMethod === "creditCard" 
                        ? "border-blue-500 bg-blue-900/20" 
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                    onClick={() => setSelectedPaymentMethod("creditCard")}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className={`h-6 w-6 ${
                        selectedPaymentMethod === "creditCard" ? "text-blue-400" : "text-gray-400"
                      }`} />
                      <span className="text-sm">Card</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedPaymentMethod === "paypal" 
                        ? "border-blue-500 bg-blue-900/20" 
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                    onClick={() => setSelectedPaymentMethod("paypal")}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className={`h-6 w-6 ${
                        selectedPaymentMethod === "paypal" ? "text-blue-400" : "text-gray-400"
                      }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 11l4-7h6l-1 7h-9z" />
                        <path d="M4 20l3-9h10l-1 9H4z" />
                      </svg>
                      <span className="text-sm">PayPal</span>
                    </div>
                  </div>
                  
                  {/* New M-Pesa option */}
                  <div 
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedPaymentMethod === "mpesa" 
                        ? "border-green-500 bg-green-900/20" 
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                    onClick={() => setSelectedPaymentMethod("mpesa")}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Phone className={`h-6 w-6 ${
                        selectedPaymentMethod === "mpesa" ? "text-green-400" : "text-gray-400"
                      }`} />
                      <span className="text-sm">M-Pesa</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Show phone number input when M-Pesa is selected */}
              {selectedPaymentMethod === "mpesa" && (
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
              )}
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0 || (selectedPaymentMethod === "mpesa" && !phoneNumber)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {isVerifying ? "Verifying payment..." : "Processing..."}
                    </span>
                  ) : (
                    `Top Up ${formatCurrency(amount)}`
                  )}
                </button>
              </div>
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
    </AnimatePresence>
  );
} 