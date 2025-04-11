import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  X, Save, User, Bell, Shield, CreditCard, 
  Moon, Sun, Monitor, Smartphone, Globe, Volume2, VolumeX,
  ChevronLeft, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export function SettingsPanel({ isOpen, onClose }) {
  const { user } = useUser();
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

  useEffect(() => {
    fetchUserSettings();
  }, [user?.id]);

  const fetchUserSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success("Settings saved successfully");
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 
                     w-full md:w-[42rem] max-h-[90vh] md:max-h-[85vh] bg-gray-900 md:rounded-2xl shadow-xl 
                     border border-gray-800 z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onClose}
                  className="md:hidden p-2 hover:bg-gray-800/50 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold">Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="hidden md:block p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Tabs - Horizontal scroll on mobile, vertical on desktop */}
              <div className="flex md:flex-col md:w-48 border-b md:border-b-0 md:border-r border-gray-800 bg-gray-900/50 overflow-x-auto md:overflow-x-visible">
                <div className="flex md:flex-col p-1 md:p-2 min-w-full md:min-w-0 md:space-y-1">
                  {[
                    { id: "account", label: "Account", icon: User },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "privacy", label: "Privacy", icon: Shield },
                    { id: "billing", label: "Billing", icon: CreditCard }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 p-3 md:px-4 md:py-2.5 rounded-lg whitespace-nowrap transition-colors
                        ${activeTab === tab.id 
                          ? "bg-blue-600/20 text-blue-400" 
                          : "hover:bg-gray-800/50 text-gray-400 hover:text-gray-200"}`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Account Settings */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Display Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { mode: "light", icon: Sun, label: "Light" },
                            { mode: "dark", icon: Moon, label: "Dark" },
                            { mode: "system", icon: Monitor, label: "System" }
                          ].map((option) => (
                            <button
                              key={option.mode}
                              onClick={() => handleChange('displayMode', option.mode)}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors
                                ${settings.displayMode === option.mode
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                  : 'border-gray-700 hover:border-gray-600 text-gray-400'}`}
                            >
                              <option.icon className="h-5 w-5 mb-1" />
                              <span className="text-sm">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                        <select 
                          value={settings.language}
                          onChange={(e) => handleChange('language', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-400">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.emailNotifications}
                            onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-gray-400">Receive push notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.pushNotifications}
                            onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Sound Effects</h4>
                          <p className="text-sm text-gray-400">Play sounds for notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.soundEnabled}
                            onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Privacy Mode</label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <button
                            onClick={() => handleChange('privacyMode', 'public')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                              settings.privacyMode === 'public'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                            }`}
                          >
                            <Globe className="h-6 w-6 mb-2" />
                            <span className="text-sm">Public</span>
                          </button>
                          
                          <button
                            onClick={() => handleChange('privacyMode', 'balanced')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                              settings.privacyMode === 'balanced'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                            }`}
                          >
                            <Shield className="h-6 w-6 mb-2" />
                            <span className="text-sm">Balanced</span>
                          </button>
                          
                          <button
                            onClick={() => handleChange('privacyMode', 'private')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                              settings.privacyMode === 'private'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'
                            }`}
                          >
                            <Shield className="h-6 w-6 mb-2" />
                            <span className="text-sm">Private</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "billing" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Billing & Payments</h3>
                    <div className="p-4 border border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">
                        Manage your subscription and payment methods through our secure payment portal.
                      </p>
                      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 p-4 sticky bottom-0 bg-gray-900">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 