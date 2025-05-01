import { useState, useEffect, useCallback } from "react";
import { 
  Save,  CreditCard, 
  Moon, Sun, Monitor,
  Loader2, DollarSign, CheckCircle
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
  const [saveSuccess, setSaveSuccess] = useState(false);


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

  // Fetch real user settings from database
  const fetchUserSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user settings');
      }
      
      const data = await response.json();
      
      // Update settings with data from database
      setSettings({
        darkMode: data.darkMode ?? true,
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? false,
        soundEnabled: data.soundEnabled ?? true,
        language: data.language ?? "english",
        displayMode: data.displayMode ?? "system",
        privacyMode: data.privacyMode ?? "balanced"
      });
      
      // Set selected currency from user profile or default
      if (data.preferredCurrency) {
        setSelectedCurrency(data.preferredCurrency);
      } else if (defaultCurrency?.code) {
        setSelectedCurrency(defaultCurrency.code);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, defaultCurrency?.code]); 

  // Fetch user settings when panel opens
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchUserSettings();
    }
  }, [isOpen, session, fetchUserSettings]);

  // Update selected currency when defaultCurrency changes
  useEffect(() => {
    if (defaultCurrency?.code && !settings.preferredCurrency) {
      setSelectedCurrency(defaultCurrency.code);
    }
  }, [defaultCurrency, settings.preferredCurrency]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Save general settings
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          preferredCurrency: selectedCurrency
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Handle currency preference separately if needed
      if (defaultCurrency?.code && selectedCurrency !== defaultCurrency.code) {
        const success = await setUserCurrency(selectedCurrency);
        if (!success) {
          throw new Error("Failed to update currency preference");
        }
      }
      
      setSaveSuccess(true);
      toast.success("Settings saved successfully");
      
      // Remove the auto-close timeout
      // Let the user decide when to close the panel
      if (autoCloseDelay > 0) {
        setTimeout(() => {
          onClose();
        }, autoCloseDelay);
      }
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
  
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
      
      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Account Settings */}
            <div className={activeTab === "account" ? "block" : "hidden"}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    disabled={true}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-60"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Name displayed on your profile and comments
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled={true}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-60"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your account email (contact support to change)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Privacy Mode
                  </label>
                  <select
                    value={settings.privacyMode}
                    onChange={(e) => handleSettingChange('privacyMode', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                  >
                    <option value="private">Private - Maximum privacy</option>
                    <option value="balanced">Balanced - Recommended</option>
                    <option value="public">Public - Maximum visibility</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Controls visibility of your activity and profile
                  </p>
                </div>
              </div>
            </div>
            
            {/* Preferences Settings */}
            <div className={activeTab === "preferences" ? "block" : "hidden"}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Mode
                  </label>
                  <div className="flex border border-gray-700 rounded-md overflow-hidden">
                    <button
                      onClick={() => handleSettingChange('displayMode', 'dark')}
                      className={`flex-1 flex items-center justify-center py-2 px-3 ${
                        settings.displayMode === 'dark' 
                          ? 'bg-gray-700 text-blue-400' 
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('displayMode', 'light')}
                      className={`flex-1 flex items-center justify-center py-2 px-3 ${
                        settings.displayMode === 'light' 
                          ? 'bg-gray-700 text-blue-400' 
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('displayMode', 'system')}
                      className={`flex-1 flex items-center justify-center py-2 px-3 ${
                        settings.displayMode === 'system' 
                          ? 'bg-gray-700 text-blue-400' 
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="swahili">Swahili</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-300">Email Notifications</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-300">Push Notifications</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-300">Sound Effects</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Payment Settings */}
            <div className={activeTab === "payments" ? "block" : "hidden"}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Currency
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                    </div>
                    <select
                      value={selectedCurrency}
                      onChange={handleCurrencyChange}
                      className="block w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                      disabled={isCurrencyLoading}
                    >
                      {isCurrencyLoading ? (
                        <option>Loading currencies...</option>
                      ) : (
                        currencies.map(curr => (
                          <option key={curr.code} value={curr.code}>
                            {curr.name} ({curr.symbol})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Currency used for displaying prices and payments
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Payment Methods
                  </h3>
                  
                  <div className="bg-gray-800 rounded-md p-3 mb-3">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-300">Visa •••• 4242</div>
                        <div className="text-xs text-gray-500">Expires 12/25</div>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs font-medium text-green-500 bg-green-900/20 px-2 py-1 rounded">
                          Default
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    + Add payment method
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Footer with Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className={`flex items-center px-4 py-2 rounded-md ${
              saveSuccess 
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
        
        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-300">Your settings have been successfully saved.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 