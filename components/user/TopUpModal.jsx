import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, DollarSign } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import toast from "react-hot-toast";

export function TopUpModal({ isOpen, onClose, onComplete, currentBalance }) {
  const [amount, setAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, defaultCurrency} = useCurrency();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("creditCard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/user/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          currencyCode: defaultCurrency.code,
          type: "topup",
          paymentMethod: selectedPaymentMethod,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to top up account");
      }
      
      const data = await response.json();
      onComplete(data.newBalance);
    } catch (error) {
      console.error("Error topping up account:", error);
      toast.error(error.message || "Failed to top up your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Top Up Balance</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({defaultCurrency.symbol})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Current balance: {formatCurrency(currentBalance)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`border ${
                      selectedPaymentMethod === "creditCard" 
                        ? "border-blue-500 bg-blue-900/20" 
                        : "border-gray-600 bg-gray-700/50"
                    } rounded-lg p-3 cursor-pointer transition-colors`}
                    onClick={() => setSelectedPaymentMethod("creditCard")}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className={`h-6 w-6 ${
                        selectedPaymentMethod === "creditCard" ? "text-blue-400" : "text-gray-400"
                      }`} />
                      <span className="text-sm">Credit Card</span>
                    </div>
                  </div>
                  
                  <div
                    className={`border ${
                      selectedPaymentMethod === "paypal" 
                        ? "border-blue-500 bg-blue-900/20" 
                        : "border-gray-600 bg-gray-700/50"
                    } rounded-lg p-3 cursor-pointer transition-colors`}
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
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    `Top Up ${formatCurrency(amount)}`
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 