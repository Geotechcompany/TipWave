"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Wallet,
  User, Trash2, X,
  Bell,
  Lock,
  Loader2,
  PlusCircle,
  Save as SaveIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPanel() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      displayName: "",
      bio: "",
      location: "",
      genres: ""
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      songRequests: true,
      earnings: true
    },
    privacySettings: {
      showPlayHistory: true,
      allowTagging: true,
      publicProfile: true,
      showEarnings: false
    }
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawalMethodsLoading, setIsWithdrawalMethodsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Withdrawal methods
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [availableWithdrawalMethods, setAvailableWithdrawalMethods] = useState([]);
  const [isAddingWithdrawal, setIsAddingWithdrawal] = useState(false);
  const [newWithdrawalMethod, setNewWithdrawalMethod] = useState({
    methodId: "",
    accountNumber: "",
    accountName: "",
    isDefault: false,
    additionalInfo: {}
  });
  
  // Fetch DJ profile data
  const fetchDJProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      // First set profile data from session as fallback
      setProfileData({
        displayName: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        // Default values for other fields
        bio: '',
        location: '',
        genres: []
      });
      
      // Update settings with session data
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          displayName: session.user.name || prev.profile.displayName,
          email: session.user.email || prev.profile.email,
        }
      }));
      
      // Then try to fetch from API
      const response = await fetch(`/api/dj/${session.user.id}/profile`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData({
            ...data.profile,
            email: data.profile.email || session.user.email || ''
          });
          
          // Update settings with this data
          setSettings(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              displayName: data.profile.displayName || prev.profile.displayName,
              email: data.profile.email || session.user.email || prev.profile.email,
              bio: data.profile.bio || prev.profile.bio,
              location: data.profile.location || prev.profile.location,
              genres: data.profile.genres?.join(', ') || prev.profile.genres
            }
          }));
        }
      } else if (response.status === 404) {
        console.log('Profile not found in database, using session data instead');
        // We already set the profile data from session above
      } else {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  // Fetch settings data
  const fetchSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(currentSettings => ({
        ...currentSettings,
        ...(data.settings || {})
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);
  
  // Fetch withdrawal methods
  const fetchWithdrawalMethods = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsWithdrawalMethodsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods`);
      if (!response.ok) throw new Error('Failed to fetch withdrawal methods');
      
      const data = await response.json();
      setWithdrawalMethods(data.methods || []);
      
      // Also fetch available withdrawal method types
      const availableResponse = await fetch('/api/withdrawal-methods');
      if (!availableResponse.ok) throw new Error('Failed to fetch available withdrawal methods');
      
      const availableData = await availableResponse.json();
      setAvailableWithdrawalMethods(availableData.methods || []);
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      toast.error('Failed to load withdrawal methods');
    } finally {
      setIsWithdrawalMethodsLoading(false);
    }
  }, [session?.user?.id]);
  
  // Load data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchDJProfile();
      fetchSettings();
      fetchWithdrawalMethods();
    }
  }, [session?.user?.id, fetchDJProfile, fetchSettings, fetchWithdrawalMethods]);
  
  // Save settings
  const saveSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsSaving(true);
      
      // Only send the necessary settings data to avoid conflicts
      const settingsToSave = {
        notificationPreferences: settings.notificationPreferences,
        privacySettings: settings.privacySettings
      };
      
      const response = await fetch(`/api/dj/${session.user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      // Also update profile if in profile tab
      if (activeTab === "profile") {
        const profileResponse = await fetch(`/api/dj/${session.user.id}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName: settings.profile.displayName,
            bio: settings.profile.bio,
            location: settings.profile.location,
            genres: settings.profile.genres.split(',').map(g => g.trim()).filter(Boolean)
          }),
        });
        
        if (!profileResponse.ok) throw new Error('Failed to update profile');
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [session?.user?.id, settings, activeTab]);
  
  // Add withdrawal method
  const addWithdrawalMethod = async () => {
    if (!session?.user?.id) return;
    
    // Validate inputs
    if (!newWithdrawalMethod.methodId) {
      toast.error('Please select a payment method type');
      return;
    }
    
    if (!newWithdrawalMethod.accountName) {
      toast.error('Please enter an account name');
      return;
    }
    
    if (!newWithdrawalMethod.accountNumber) {
      toast.error('Please enter an account number or email');
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWithdrawalMethod),
      });
      
      if (!response.ok) throw new Error('Failed to add withdrawal method');
      
      const data = await response.json();
      
      // Update local state
      setWithdrawalMethods(methods => [...methods, data.method]);
      
      // Reset form
      setNewWithdrawalMethod({
        methodId: "",
        accountNumber: "",
        accountName: "",
        isDefault: false,
        additionalInfo: {}
      });
      
      // Close form
      setIsAddingWithdrawal(false);
      
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding withdrawal method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete withdrawal method
  const deleteWithdrawalMethod = async (methodId) => {
    if (!session?.user?.id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods/${methodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete withdrawal method');
      
      // Update local state
      setWithdrawalMethods(methods => methods.filter(method => method._id !== methodId));
      
      toast.success('Payment method removed');
    } catch (error) {
      console.error('Error deleting withdrawal method:', error);
      toast.error('Failed to remove payment method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Set default withdrawal method
  const setDefaultWithdrawalMethod = async (methodId) => {
    if (!session?.user?.id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods/${methodId}/default`, {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('Failed to set default withdrawal method');
      
      // Update local state
      setWithdrawalMethods(methods => 
        methods.map(method => ({
          ...method,
          isDefault: method._id === methodId
        }))
      );
      
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default withdrawal method:', error);
      toast.error('Failed to update default payment method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle toggle changes
  const handleToggleChange = (section, field) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field]
      }
    });
  };
  
  // Handle new withdrawal method changes
  const handleNewWithdrawalMethodChange = (field, value) => {
    setNewWithdrawalMethod({
      ...newWithdrawalMethod,
      [field]: value
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 rounded-xl p-0 md:p-6 shadow-lg w-full"
    >
      <div className="w-full">
        {/* Mobile-friendly tabs - make them look like the screenshot */}
        <div className="flex overflow-x-auto mb-4 bg-gray-800/50 rounded-t-xl md:rounded-xl scrollbar-hide">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center justify-center px-3 py-3 flex-1 min-w-[80px] text-center border-b-2 ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <User className="h-4 w-4 mr-1.5" />
            <span className="whitespace-nowrap text-sm">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center justify-center px-3 py-3 flex-1 min-w-[80px] text-center border-b-2 ${
              activeTab === "notifications"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Bell className="h-4 w-4 mr-1.5" />
            <span className="whitespace-nowrap text-sm">Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center justify-center px-3 py-3 flex-1 min-w-[80px] text-center border-b-2 ${
              activeTab === "privacy"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Lock className="h-4 w-4 mr-1.5" />
            <span className="whitespace-nowrap text-sm">Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab("withdrawalMethods")}
            className={`flex items-center justify-center px-3 py-3 flex-1 min-w-[80px] text-center border-b-2 ${
              activeTab === "withdrawalMethods"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Wallet className="h-4 w-4 mr-1.5" />
            <span className="whitespace-nowrap text-sm">Payment</span>
          </button>
        </div>

        {/* Settings content */}
        <div className="bg-gray-900 md:bg-gray-800 rounded-b-xl md:rounded-xl p-4 md:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-5 p-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          displayName: e.target.value
                        }
                      })}
                      className="w-full bg-gray-800 md:bg-gray-700 border border-gray-700 md:border-gray-600 rounded-lg text-white px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profileData?.email || session?.user?.email || ''}
                      disabled
                      className="w-full bg-gray-800/50 md:bg-gray-800/50 border border-gray-700 md:border-gray-700 rounded-lg text-gray-400 px-4 py-2.5 cursor-not-allowed"
                      placeholder="Your email address"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={settings.profile.bio}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          bio: e.target.value
                        }
                      })}
                      className="w-full bg-gray-800 md:bg-gray-700 border border-gray-700 md:border-gray-600 rounded-lg text-white px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={settings.profile.location}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          location: e.target.value
                        }
                      })}
                      className="w-full bg-gray-800 md:bg-gray-700 border border-gray-700 md:border-gray-600 rounded-lg text-white px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="genres" className="block text-sm font-medium text-white mb-2">
                      Music Genres
                    </label>
                    <input
                      id="genres"
                      type="text"
                      value={settings.profile.genres}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          genres: e.target.value
                        }
                      })}
                      className="w-full bg-gray-800 md:bg-gray-700 border border-gray-700 md:border-gray-600 rounded-lg text-white px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hip-Hop, EDM, Pop, etc. (comma separated)"
                    />
                  </div>
                  
                  {/* Save Button - Mobile specific placement */}
                  <div className="mt-6 pt-4">
                    <button
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                      <p className="text-xs text-gray-400">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.email}
                        onChange={() => handleToggleChange("notificationPreferences", "email")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Push Notifications</h3>
                      <p className="text-xs text-gray-400">Receive alerts on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.push}
                        onChange={() => handleToggleChange("notificationPreferences", "push")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">SMS Notifications</h3>
                      <p className="text-xs text-gray-400">Receive text messages for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.sms}
                        onChange={() => handleToggleChange("notificationPreferences", "sms")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Song Request Notifications</h3>
                      <p className="text-xs text-gray-400">Get notified about new song requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.songRequests}
                        onChange={() => handleToggleChange("notificationPreferences", "songRequests")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Earnings Notifications</h3>
                      <p className="text-xs text-gray-400">Get notified about new earnings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationPreferences.earnings}
                        onChange={() => handleToggleChange("notificationPreferences", "earnings")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <div className="space-y-5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Public Profile</h3>
                      <p className="text-xs text-gray-400">Allow others to view your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacySettings.publicProfile}
                        onChange={() => handleToggleChange("privacySettings", "publicProfile")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Show Play History</h3>
                      <p className="text-xs text-gray-400">Display your recently played songs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacySettings.showPlayHistory}
                        onChange={() => handleToggleChange("privacySettings", "showPlayHistory")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Allow Tagging</h3>
                      <p className="text-xs text-gray-400">Let others tag you in posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacySettings.allowTagging}
                        onChange={() => handleToggleChange("privacySettings", "allowTagging")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Show Earnings</h3>
                      <p className="text-xs text-gray-400">Display your earnings on your public profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacySettings.showEarnings}
                        onChange={() => handleToggleChange("privacySettings", "showEarnings")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Withdrawal Methods */}
              {activeTab === "withdrawalMethods" && (
                <div className="space-y-6 p-4">
                  {isWithdrawalMethodsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <>
                      {/* Existing withdrawal methods */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Your Payment Methods</h3>
                        
                        {withdrawalMethods.length === 0 ? (
                          <div className="bg-gray-800 rounded-lg p-6 text-center">
                            <p className="text-gray-400">No payment methods added yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {withdrawalMethods.map((method) => (
                              <div key={method._id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Wallet className="h-4 w-4 text-blue-400" />
                                      <h4 className="font-medium text-white">
                                        {method.accountName}
                                        {method.isDefault && (
                                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                            Default
                                          </span>
                                        )}
                                      </h4>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {method.accountNumber}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    {!method.isDefault && (
                                      <button
                                        onClick={() => setDefaultWithdrawalMethod(method._id)}
                                        disabled={isSaving}
                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                                      >
                                        Set Default
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteWithdrawalMethod(method._id)}
                                      disabled={isSaving || method.isDefault}
                                      className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:text-red-300/50 text-white px-3 py-1 rounded-md"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Add new withdrawal method */}
                      <div className="mt-8">
                        <button
                          onClick={() => setIsAddingWithdrawal(!isAddingWithdrawal)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
                        >
                          {isAddingWithdrawal ? (
                            <>
                              <X className="h-4 w-4" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4" />
                              Add Payment Method
                            </>
                          )}
                        </button>
                        
                        {isAddingWithdrawal && (
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h4 className="font-medium text-white mb-4">Add New Payment Method</h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Payment Method Type
                                </label>
                                <select
                                  value={newWithdrawalMethod.methodId}
                                  onChange={(e) => handleNewWithdrawalMethodChange('methodId', e.target.value)}
                                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select a payment method</option>
                                  {availableWithdrawalMethods.map((method) => (
                                    <option key={method._id} value={method._id}>
                                      {method.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Account Name
                                </label>
                                <input
                                  type="text"
                                  value={newWithdrawalMethod.accountName}
                                  onChange={(e) => handleNewWithdrawalMethodChange('accountName', e.target.value)}
                                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="John Doe"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Account Number / Email
                                </label>
                                <input
                                  type="text"
                                  value={newWithdrawalMethod.accountNumber}
                                  onChange={(e) => handleNewWithdrawalMethodChange('accountNumber', e.target.value)}
                                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Account number or email address"
                                />
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="isDefault"
                                  checked={newWithdrawalMethod.isDefault}
                                  onChange={(e) => handleNewWithdrawalMethodChange('isDefault', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                                />
                                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-300">
                                  Set as default payment method
                                </label>
                              </div>
                              
                              <div className="flex justify-end">
                                <button
                                  onClick={addWithdrawalMethod}
                                  disabled={isSaving}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircle className="h-4 w-4" />
                                      Add Method
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}