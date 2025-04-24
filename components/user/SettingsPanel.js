import { useState, useEffect } from "react";
import { 
  Save, User, Bell, Shield, CreditCard, 
  Moon, Sun, Monitor, Smartphone, Globe, Volume2, VolumeX,
  Loader2, DollarSign
} from "lucide-react";
import toast from "react-hot-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";

export function SettingsPanel({ isOpen, onClose }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    language: "english",
    displayMode: "system",
    privacyMode: "balanced"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Currency settings
  const { 
    currencies = [], 
    defaultCurrency = { code: "USD", symbol: "$", name: "US Dollar" }, 
    setUserCurrency, 
    isLoading: isCurrencyLoading = false
  } = useCurrency() || {};
  
  const [selectedCurrency, setSelectedCurrency] = useState(
    defaultCurrency?.code || "USD"
  );

  // Fetch user settings when panel opens
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchUserSettings();
    }
  }, [isOpen, session]);

  // Update selected currency when defaultCurrency changes
  useEffect(() => {
    if (defaultCurrency?.code) {
      setSelectedCurrency(defaultCurrency.code);
    }
  }, [defaultCurrency]);

  const fetchUserSettings = async () => {
    setIsLoading(true);
    try {
      // Simulation: replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Some mock settings loading
      setSettings({
        darkMode: true,
        emailNotifications: true,
        pushNotifications: false,
        soundEnabled: true,
        language: "english",
        displayMode: "system",
        privacyMode: "balanced"
      });
      
      // Set selected currency from user profile or default
      if (defaultCurrency?.code) {
        setSelectedCurrency(defaultCurrency.code);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save general settings
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save currency preference if changed and we have a default to compare against
      if (defaultCurrency?.code && selectedCurrency !== defaultCurrency.code) {
        const success = await setUserCurrency(selectedCurrency);
        if (!success) {
          throw new Error("Failed to update currency preference");
        }
      }
      
      toast.success("Settings saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  return (
    <div className="w-full bg-gray-900">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${
            activeTab === "account" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${
            activeTab === "preferences" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${
            activeTab === "payments" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Payments
        </button>
      </div>
      
      {/* Settings Content */}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your display name"
                        defaultValue={session?.user?.name || ""}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your.email@example.com"
                        defaultValue={session?.user?.email || ""}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-400" />
                    Notifications
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.emailNotifications}
                          onChange={() => setSettings({
                            ...settings,
                            emailNotifications: !settings.emailNotifications
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-400">Receive on device alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.pushNotifications}
                          onChange={() => setSettings({
                            ...settings,
                            pushNotifications: !settings.pushNotifications
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preferences Settings */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Moon className="w-5 h-5 mr-2 text-blue-400" />
                    Appearance
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Display Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          className={`p-3 rounded-lg flex flex-col items-center ${
                            settings.displayMode === "light" 
                              ? "bg-blue-900/50 border border-blue-500/50" 
                              : "bg-gray-800 border border-gray-700"
                          }`}
                          onClick={() => setSettings({...settings, displayMode: "light"})}
                        >
                          <Sun className="h-5 w-5 mb-1" />
                          <span className="text-xs">Light</span>
                        </button>
                        <button
                          className={`p-3 rounded-lg flex flex-col items-center ${
                            settings.displayMode === "dark" 
                              ? "bg-blue-900/50 border border-blue-500/50" 
                              : "bg-gray-800 border border-gray-700"
                          }`}
                          onClick={() => setSettings({...settings, displayMode: "dark"})}
                        >
                          <Moon className="h-5 w-5 mb-1" />
                          <span className="text-xs">Dark</span>
                        </button>
                        <button
                          className={`p-3 rounded-lg flex flex-col items-center ${
                            settings.displayMode === "system" 
                              ? "bg-blue-900/50 border border-blue-500/50" 
                              : "bg-gray-800 border border-gray-700"
                          }`}
                          onClick={() => setSettings({...settings, displayMode: "system"})}
                        >
                          <Monitor className="h-5 w-5 mb-1" />
                          <span className="text-xs">System</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sound Effects</p>
                        <p className="text-sm text-gray-400">Enable UI sound effects</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.soundEnabled}
                          onChange={() => setSettings({
                            ...settings,
                            soundEnabled: !settings.soundEnabled
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-400" />
                    Language & Region
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Language
                      </label>
                      <select
                        className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="japanese">Japanese</option>
                      </select>
                    </div>
                    
                    {/* Currency Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Preferred Currency
                      </label>
                      <select 
                        className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                        disabled={isCurrencyLoading}
                      >
                        {currencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        All amounts will be displayed in your preferred currency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payments Settings */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                    Payment Methods
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                          <CreditCard className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Card •••• 4242</p>
                          <p className="text-xs text-gray-400">Expires 12/24</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                          Edit
                        </button>
                        <button className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded">
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
                      + Add Payment Method
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
                    Billing Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto Top-up</p>
                        <p className="text-sm text-gray-400">Automatically add funds when balance is low</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={false}
                          onChange={() => {}}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Receipt Emails</p>
                        <p className="text-sm text-gray-400">Send email receipts for transactions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={true}
                          onChange={() => {}}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer / Save Button */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 
                   bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed
                   text-white rounded-xl transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
} 