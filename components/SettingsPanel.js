"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Bell, Save, Loader2, Lock, PlusCircle, 
   CheckCircle, AlertTriangle, Wallet,
  User, 
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
  
  // Fetch settings data
  const fetchSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(currentSettings => data.settings || currentSettings);
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
      fetchSettings();
      fetchWithdrawalMethods();
    }
  }, [session?.user?.id, fetchSettings, fetchWithdrawalMethods]);
  
  // Save settings
  const saveSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [session?.user?.id, settings]);
  
  // Add withdrawal method
  const addWithdrawalMethod = async () => {
    if (!session?.user?.id) return;
    
    try {
      if (!newWithdrawalMethod.methodId) {
        return toast.error('Please select a withdrawal method');
      }
      
      if (!newWithdrawalMethod.accountNumber) {
        return toast.error('Please enter an account number');
      }
      
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWithdrawalMethod),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add withdrawal method');
      }
      
      // Reset form and refresh list
      setNewWithdrawalMethod({
        methodId: "",
        accountNumber: "",
        accountName: "",
        isDefault: false,
        additionalInfo: {}
      });
      setIsAddingWithdrawal(false);
      fetchWithdrawalMethods();
      toast.success('Withdrawal method added successfully');
    } catch (error) {
      console.error('Error adding withdrawal method:', error);
      toast.error(error.message || 'Failed to add withdrawal method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete withdrawal method
  const deleteWithdrawalMethod = async (id) => {
    if (!session?.user?.id || !id) return;
    
    if (!confirm('Are you sure you want to delete this withdrawal method?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete withdrawal method');
      
      fetchWithdrawalMethods();
      toast.success('Withdrawal method deleted successfully');
    } catch (error) {
      console.error('Error deleting withdrawal method:', error);
      toast.error('Failed to delete withdrawal method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Set default withdrawal method
  const setDefaultWithdrawalMethod = async (id) => {
    if (!session?.user?.id || !id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/dj/${session.user.id}/withdrawal-methods/${id}/default`, {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('Failed to set default withdrawal method');
      
      fetchWithdrawalMethods();
      toast.success('Default withdrawal method updated');
    } catch (error) {
      console.error('Error setting default withdrawal method:', error);
      toast.error('Failed to update default withdrawal method');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get withdrawal method details
  const getWithdrawalMethodDetails = (methodId) => {
    return availableWithdrawalMethods.find(method => method._id === methodId);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 font-medium ${
              activeTab === "profile"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab("withdrawal")}
            className={`pb-3 px-4 font-medium ${
              activeTab === "withdrawal"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Withdrawal Methods
            </div>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-3 px-4 font-medium ${
              activeTab === "notifications"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </div>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`pb-3 px-4 font-medium ${
              activeTab === "privacy"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </div>
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile?.displayName || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            displayName: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Your DJ name"
                      />
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={settings.profile?.bio || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            bio: e.target.value
                          }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={settings.profile?.location || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            location: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Genre Specialties
                      </label>
                      <input
                        type="text"
                        value={settings.profile?.genres || ""}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            genres: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Hip Hop, House, R&B (comma separated)"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Withdrawal Methods Tab */}
              {activeTab === "withdrawal" && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Withdrawal Methods</h3>
                  
                  {isWithdrawalMethodsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : withdrawalMethods.length === 0 ? (
                    <div className="bg-gray-700/30 rounded-lg p-8 text-center">
                      <Wallet className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <h3 className="text-lg font-medium text-white mb-2">No withdrawal methods yet</h3>
                      <p className="text-gray-400 mb-6">Add a withdrawal method to receive your earnings</p>
                      <button
                        onClick={() => setIsAddingWithdrawal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Withdrawal Method
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {withdrawalMethods.map((method) => {
                        const methodDetails = getWithdrawalMethodDetails(method.methodId);
                        return (
                          <div key={method._id} className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="bg-gray-600 p-2 rounded-lg mr-3">
                                  <Wallet className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-white">{methodDetails?.name || "Withdrawal Method"}</h4>
                                    {method.isDefault && (
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-900/60 text-green-400 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {method.accountNumber} 
                                    {method.accountName && ` • ${method.accountName} (M-Pesa)`}
                                  </p>
                                  <div className="mt-2 flex space-x-2">
                                    {!method.isDefault && (
                                      <button
                                        onClick={() => setDefaultWithdrawalMethod(method._id)}
                                        disabled={isSaving}
                                        className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-300 transition-colors"
                                      >
                                        Set as Default
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteWithdrawalMethod(method._id)}
                                      disabled={isSaving}
                                      className="text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900/50 rounded text-red-400 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="mt-4">
                        <button
                          onClick={() => setIsAddingWithdrawal(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Another Method
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Add Withdrawal Method Form */}
                  {isAddingWithdrawal && (
                    <div className="mt-6 bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-white mb-4">Add Withdrawal Method</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Withdrawal Method
                          </label>
                          <select
                            value={newWithdrawalMethod.methodId}
                            onChange={(e) => setNewWithdrawalMethod({
                              ...newWithdrawalMethod,
                              methodId: e.target.value
                            })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                          >
                            <option value="">Select a withdrawal method</option>
                            {availableWithdrawalMethods.map((method) => (
                              <option key={method._id} value={method._id}>
                                {method.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            M-Pesa Number
                          </label>
                          <input
                            type="tel"
                            value={newWithdrawalMethod.accountNumber}
                            onChange={(e) => setNewWithdrawalMethod({
                              ...newWithdrawalMethod,
                              accountNumber: e.target.value
                            })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                            placeholder="Enter M-Pesa number (e.g., 254712345678)"
                            pattern="[0-9]*"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            M-Pesa Name
                          </label>
                          <input
                            type="text"
                            value={newWithdrawalMethod.accountName}
                            onChange={(e) => setNewWithdrawalMethod({
                              ...newWithdrawalMethod,
                              accountName: e.target.value
                            })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                            placeholder="Enter M-Pesa registered name"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={newWithdrawalMethod.isDefault}
                            onChange={(e) => setNewWithdrawalMethod({
                              ...newWithdrawalMethod,
                              isDefault: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                          />
                          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-300">
                            Set as default withdrawal method
                          </label>
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={addWithdrawalMethod}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Add Method
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setIsAddingWithdrawal(false)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notificationPreferences?.email}
                          onChange={e => setSettings({
                            ...settings,
                            notificationPreferences: {
                              ...settings.notificationPreferences,
                              email: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-400">Receive push notifications on your device</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notificationPreferences?.push}
                          onChange={e => setSettings({
                            ...settings,
                            notificationPreferences: {
                              ...settings.notificationPreferences,
                              push: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-400">Receive text messages for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notificationPreferences?.sms}
                          onChange={e => setSettings({
                            ...settings,
                            notificationPreferences: {
                              ...settings.notificationPreferences,
                              sms: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Song Request Notifications</p>
                        <p className="text-sm text-gray-400">Get notified about new song requests</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notificationPreferences?.songRequests}
                          onChange={e => setSettings({
                            ...settings,
                            notificationPreferences: {
                              ...settings.notificationPreferences,
                              songRequests: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Earnings Notifications</p>
                        <p className="text-sm text-gray-400">Get notified about earnings and payouts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notificationPreferences?.earnings}
                          onChange={e => setSettings({
                            ...settings,
                            notificationPreferences: {
                              ...settings.notificationPreferences,
                              earnings: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Public Profile</p>
                        <p className="text-sm text-gray-400">Make your profile visible to others</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.privacySettings?.publicProfile}
                          onChange={e => setSettings({
                            ...settings,
                            privacySettings: {
                              ...settings.privacySettings,
                              publicProfile: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Show Earnings</p>
                        <p className="text-sm text-gray-400">Display your earnings on your profile</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.privacySettings?.showEarnings}
                          onChange={e => setSettings({
                            ...settings,
                            privacySettings: {
                              ...settings.privacySettings,
                              showEarnings: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-medium">Show Play History</p>
                        <p className="text-sm text-gray-400">Let others see your recent plays</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.privacySettings?.showPlayHistory}
                          onChange={e => setSettings({
                            ...settings,
                            privacySettings: {
                              ...settings.privacySettings,
                              showPlayHistory: e.target.checked
                            }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 bg-amber-900/20 border border-amber-900/40 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-500">Privacy Notice</h3>
                        <p className="mt-1 text-sm text-amber-400/80">
                          Your privacy settings control what information is visible to others. Some information
                          may still be visible to event organizers when you participate in their events.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
    </motion.div>
  );
}