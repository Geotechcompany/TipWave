import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Save, Loader2, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function SettingsPanel() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      songRequests: true,
      events: true
    },
    appearance: {
      theme: "dark",
      fontSize: "normal"
    },
    privacy: {
      profileVisibility: "public",
      showEarnings: false
    }
  });

  const fetchSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dj/${session.user.id}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/dj/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 px-4 sm:px-0">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
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

      <div className="space-y-6 px-4 sm:px-0">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/30">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-900/50 p-2 rounded-lg mr-3">
              <Bell className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium capitalize">
                  {key === 'songRequests' ? 'Song Requests' : key}
                </label>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      [key]: !value
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                  aria-pressed={value}
                >
                  <span className="sr-only">{key} notifications</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/30">
          <div className="flex items-center mb-4">
            <div className="bg-purple-900/50 p-2 rounded-lg mr-3">
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <label className="text-sm font-medium mb-2 sm:mb-0">Profile Visibility</label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    profileVisibility: e.target.value
                  }
                })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="followers">Followers Only</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Earnings</label>
              <button
                onClick={() => setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showEarnings: !settings.privacy.showEarnings
                  }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy.showEarnings ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                aria-pressed={settings.privacy.showEarnings}
              >
                <span className="sr-only">Show earnings</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy.showEarnings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 