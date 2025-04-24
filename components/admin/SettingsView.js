import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Bell, Lock, Globe, CreditCard, Users, Settings, 
  RefreshCw, AlertCircle, DollarSign 
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { CurrencySettings } from './CurrencySettings';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    minBidAmount: 5,
    maxBidAmount: 100,
    commissionRate: 10,
    allowGuestBids: true,
    requireEmailVerification: true,
    enableNotifications: true,
    notifyOnNewBid: true,
    notifyOnBidApproval: true,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'KES'],
    currencySymbolPosition: 'before'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/settings');
      setSettings({
        ...settings, // Keep defaults as fallback
        ...response.data // Override with server values
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings from server");
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate settings before saving
      if (settings.minBidAmount < 0 || settings.maxBidAmount < 0 || settings.commissionRate < 0) {
        throw new Error("Values cannot be negative");
      }
      
      if (settings.minBidAmount > settings.maxBidAmount) {
        throw new Error("Minimum bid amount cannot be greater than maximum bid amount");
      }
      
      if (settings.commissionRate > 100) {
        throw new Error("Commission rate cannot exceed 100%");
      }
      
      // Send updated settings to the server
      await axios.post('/api/admin/settings', settings);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full px-0"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchSettings}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error Loading Settings</h3>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-400">Loading settings...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings form - only show when not loading */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full grid gap-6"
          >
            {/* User Settings */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-400" />
                User Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Allow Guest Bids</h3>
                    <p className="text-sm text-gray-400">Enable bidding for non-registered users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowGuestBids}
                      onChange={(e) => setSettings({ ...settings, allowGuestBids: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Require Email Verification</h3>
                    <p className="text-sm text-gray-400">Users must verify email before bidding</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-400" />
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Enable Admin Notifications</h3>
                    <p className="text-sm text-gray-400">Receive notifications for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {settings.enableNotifications && (
                  <div className="space-y-3 pl-4 border-l-2 border-gray-700 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">New Bid Notifications</h3>
                        <p className="text-sm text-gray-400">Get notified when users place new bids</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifyOnNewBid}
                          onChange={(e) => setSettings({ ...settings, notifyOnNewBid: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Bid Status Notifications</h3>
                        <p className="text-sm text-gray-400">Get notified when bid statuses change</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifyOnBidApproval}
                          onChange={(e) => setSettings({ ...settings, notifyOnBidApproval: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bid Settings */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                Bid Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Bid Amount ($)</label>
                  <input
                    type="number"
                    value={settings.minBidAmount}
                    onChange={(e) => setSettings({ ...settings, minBidAmount: Number(e.target.value) })}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Bid Amount ($)</label>
                  <input
                    type="number"
                    value={settings.maxBidAmount}
                    onChange={(e) => setSettings({ ...settings, maxBidAmount: Number(e.target.value) })}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Currency Settings */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <CurrencySettings />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 