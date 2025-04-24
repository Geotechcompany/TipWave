import React, { useState, useEffect } from "react";
import { 
  Trash, PlusCircle, Check, X, DollarSign, Loader2, Star, StarOff 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function CurrencySettings() {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    code: "",
    symbol: "",
    name: "",
    rate: 1,
    isActive: true
  });

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/currencies");
      if (!response.ok) throw new Error("Failed to fetch currencies");
      
      const data = await response.json();
      setCurrencies(data.currencies || []);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Failed to load currencies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/admin/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCurrency)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add currency");
      }
      
      toast.success("Currency added successfully");
      setNewCurrency({ code: "", symbol: "", name: "", rate: 1, isActive: true });
      setShowAddForm(false);
      fetchCurrencies();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCurrency = async (id, data) => {
    try {
      const response = await fetch(`/api/admin/currencies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update currency");
      }
      
      toast.success("Currency updated successfully");
      fetchCurrencies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCurrency = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/currencies/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete currency");
      }
      
      toast.success("Currency deleted successfully");
      fetchCurrencies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch("/api/admin/currencies/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyId: id })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to set default currency");
      }
      
      toast.success("Default currency updated");
      fetchCurrencies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading currency settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
          Currency Settings
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Currency
        </button>
      </div>

      {/* Currency List */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 px-2 border-b border-gray-700 pb-2">
          <div className="col-span-2">Code</div>
          <div className="col-span-2">Symbol</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-1">Default</div>
          <div className="col-span-1">Actions</div>
        </div>

        {currencies.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No currencies found. Add your first currency to get started.
          </div>
        ) : (
          currencies.map((currency) => (
            <div 
              key={currency._id} 
              className="grid grid-cols-12 gap-4 items-center py-3 px-2 bg-gray-800/30 rounded-lg"
            >
              <div className="col-span-2 font-mono text-sm">{currency.code}</div>
              <div className="col-span-2">{currency.symbol}</div>
              <div className="col-span-3 overflow-hidden text-ellipsis">{currency.name}</div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={currency.rate}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    if (!isNaN(newRate)) {
                      handleUpdateCurrency(currency._id, { ...currency, rate: newRate });
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <Switch
                  checked={currency.isActive}
                  onCheckedChange={(checked) => 
                    handleUpdateCurrency(currency._id, { ...currency, isActive: checked })
                  }
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {currency.isDefault ? (
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <button 
                    onClick={() => handleSetDefault(currency._id)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <StarOff className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleDeleteCurrency(currency._id, currency.name)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  disabled={currency.isDefault}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Currency Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-700/70 backdrop-blur-sm border border-gray-600 rounded-xl p-6 mt-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Add New Currency</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCurrency} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <input
                    id="currencyCode"
                    type="text"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2"
                    placeholder="USD"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currencySymbol">Symbol</Label>
                  <input
                    id="currencySymbol"
                    type="text"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2"
                    placeholder="$"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currencyName">Currency Name</Label>
                <input
                  id="currencyName"
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2"
                  placeholder="US Dollar"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currencyRate">Exchange Rate</Label>
                <input
                  id="currencyRate"
                  type="number"
                  value={newCurrency.rate}
                  onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2"
                  placeholder="1.0"
                  step="0.01"
                  min="0.01"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Rate relative to the base currency (e.g., 1 USD = 0.85 EUR)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="currencyActive"
                  checked={newCurrency.isActive}
                  onCheckedChange={(checked) => setNewCurrency({ ...newCurrency, isActive: checked })}
                />
                <Label htmlFor="currencyActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Currency</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-sm text-gray-400">
        <p>
          <strong>Note:</strong> The default currency is used as the base currency for all transactions.
          Exchange rates are relative to this currency.
        </p>
      </div>
    </div>
  );
} 