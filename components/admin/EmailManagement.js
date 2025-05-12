import { useState, useEffect, useCallback, useMemo } from "react";
/* eslint-disable no-unused-vars */

import { 
  Mail, Send, RefreshCw, Clock, 
  Loader2, AlertTriangle,
  Search, Filter, CheckCircle, XCircle,
  Calendar, Save, Lock, Server, Globe
} from "lucide-react";
/* eslint-enable no-unused-vars */
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmailTypes } from "@/lib/emailTypes";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

// First, move getTemplatePreviewData outside the component to avoid recreating it on every render
const getTemplatePreviewData = (templateId, emailTemplateOptions) => {
  const template = emailTemplateOptions.find(t => t.id === templateId);
  if (!template) return null;

  const sampleData = {
    [EmailTypes.USER_WELCOME]: {
      userName: "John Doe",
      email: "john@example.com"
    },
    [EmailTypes.BID_CREATED]: {
      userName: "John Doe",
      songTitle: "Dancing Queen",
      songArtist: "ABBA",
      amount: "10.00",
      eventName: "Saturday Night Party",
      djName: "DJ Max"
    },
    [EmailTypes.BID_CONFIRMATION]: {
      userName: "John Doe",
      songTitle: "Dancing Queen",
      songArtist: "ABBA",
      amount: "10.00",
      estimatedPlayTime: "10:30 PM"
    },
    [EmailTypes.WALLET_TOPUP]: {
      userName: "John Doe",
      amount: "50.00",
      newBalance: "150.00",
      transactionId: "TXN123456"
    },
    [EmailTypes.PAYMENT_STATUS]: {
      userName: "John Doe",
      amount: "10.00",
      status: "completed",
      paymentMethod: "M-Pesa",
      transactionId: "PAY789012"
    },
    [EmailTypes.SONG_REQUEST]: {
      djName: "DJ Max",
      userName: "John Doe",
      songTitle: "Dancing Queen",
      songArtist: "ABBA",
      amount: "10.00",
      message: "Please play this for my friend's birthday!"
    }
  };

  return {
    subject: template.subject,
    data: sampleData[templateId] || template.defaultData
  };
};

export default function EmailManagement({ stats: initialStats, refreshData }) {
  // Move EMAIL_PROVIDERS outside component or use useMemo if it needs component scope
  const EMAIL_PROVIDERS = [
    { id: 'smtp', name: 'SMTP Server' },
    { id: 'resend', name: 'Resend.com' }
  ];
  
  // Use useMemo for emailTemplateOptions
  const emailTemplateOptions = useMemo(() => [
    { 
      id: EmailTypes.USER_WELCOME, 
      name: "User Welcome",
      subject: "Welcome to TipWave! 🎵",
      description: "Sent to new users after registration",
      defaultData: {
        userName: "{user.name}",
        email: "{user.email}"
      }
    },
    { 
      id: EmailTypes.BID_CREATED, 
      name: "Bid Created",
      subject: "Your Song Request Bid Has Been Created 🎧",
      description: "Sent when a user creates a new song request bid",
      defaultData: {
        userName: "{user.name}",
        songTitle: "{bid.songTitle}",
        songArtist: "{bid.artist}",
        amount: "{bid.amount}",
        eventName: "{event.name}",
        djName: "{dj.name}"
      }
    },
    { 
      id: EmailTypes.BID_CONFIRMATION, 
      name: "Bid Confirmation",
      subject: "Song Request Bid Confirmed ✅",
      description: "Sent when a DJ accepts a song request bid",
      defaultData: {
        userName: "{user.name}",
        songTitle: "{bid.songTitle}",
        songArtist: "{bid.artist}",
        amount: "{bid.amount}",
        estimatedPlayTime: "{bid.estimatedPlayTime}"
      }
    },
    { 
      id: EmailTypes.WALLET_TOPUP, 
      name: "Wallet Top-up",
      subject: "Wallet Top-up Successful 💰",
      description: "Sent when a user successfully adds funds to their wallet",
      defaultData: {
        userName: "{user.name}",
        amount: "{transaction.amount}",
        newBalance: "{wallet.balance}",
        transactionId: "{transaction.id}"
      }
    },
    { 
      id: EmailTypes.PAYMENT_STATUS, 
      name: "Payment Status",
      subject: "Payment Status Update 💳",
      description: "Sent when a payment status changes",
      defaultData: {
        userName: "{user.name}",
        amount: "{payment.amount}",
        status: "{payment.status}",
        paymentMethod: "{payment.method}",
        transactionId: "{payment.id}"
      }
    },
    { 
      id: EmailTypes.SONG_REQUEST, 
      name: "Song Request",
      subject: "New Song Request 🎵",
      description: "Sent to DJs when they receive a new song request",
      defaultData: {
        djName: "{dj.name}",
        userName: "{user.name}",
        songTitle: "{request.songTitle}",
        songArtist: "{request.artist}",
        amount: "{request.amount}",
        message: "{request.message}"
      }
    }
  ], []); // Empty dependency array since these options are static

  // State declarations
  const [selectedTab, setSelectedTab] = useState("test-emails");
  const [isLoading, setIsLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [stats, setStats] = useState(initialStats || {
    sent: 0,
    scheduled: 0,
    failed: 0
  });
  
  // Initialize test email state
  const [testEmail, setTestEmail] = useState({
    to: "",
    template: EmailTypes.USER_WELCOME,
    customData: getTemplatePreviewData(EmailTypes.USER_WELCOME, emailTemplateOptions)?.data || {}
  });
  
  const [scheduledEmail, setScheduledEmail] = useState({
    template: EmailTypes.USER_WELCOME,
    recipientType: "all-users",
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: "12:00",
    customData: {
      userName: "{user.name}"
    }
  });
  
  const [bannerToast, setBannerToast] = useState({
    show: false,
    message: '',
    type: ''
  });
  
  const [smtpSettings, setSmtpSettings] = useState({
    isEnabled: false,
    host: '',
    port: '',
    secure: false,
    user: '',
    password: '',
    from: ''
  });

  const [emailProvider, setEmailProvider] = useState('smtp');
  const [resendSettings, setResendSettings] = useState({
    isEnabled: false,
    apiKey: '',
    fromEmail: ''
  });

  // Define fetch functions with useCallback
  const fetchEmailLogs = useCallback(async () => {
    try {
      console.log("Fetching email logs...");
      const response = await fetch('/api/admin/emails/logs');
      if (!response.ok) {
        console.error("Failed to fetch email logs:", response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log("Email logs fetched:", data);
      setEmailLogs(data.logs || []);

      if (data.counts) {
        const newStats = {
          sent: data.counts.sent || 0,
          failed: data.counts.failed || 0,
          scheduled: data.counts.scheduled || 0
        };
        setStats(newStats);
        console.log('Setting new stats:', newStats);
      }
    } catch (error) {
      console.error("Error fetching email logs:", error);
      showBannerToast('Failed to fetch email logs', 'error');
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/templates');
      console.log("Template API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Templates fetched:", data.templates);
        setTemplates(data.templates);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch email templates:', errorData);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  }, []);
  
  const fetchScheduledEmails = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduledEmails(data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled emails:', error);
    }
  }, []);
  
  const fetchSmtpSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/smtp-settings');
      const data = await response.json();
      
      if (response.ok) {
        setSmtpSettings(data.settings || {
          isEnabled: false,
          host: '',
          port: '',
          secure: false,
          user: '',
          password: '',
          from: ''
        });
      } else {
        throw new Error(data.error || 'Failed to load SMTP settings');
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      showBannerToast('Failed to load SMTP settings', 'error');
    }
  }, []);

  const fetchResendSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/emails/resend-settings');
      const data = await response.json();
      
      if (response.ok) {
        setResendSettings(data.settings || {
          isEnabled: false,
          apiKey: '',
          fromEmail: ''
        });
      } else {
        throw new Error(data.error || 'Failed to load Resend settings');
      }
    } catch (error) {
      console.error('Error fetching Resend settings:', error);
      showBannerToast('Failed to load Resend settings', 'error');
    }
  }, []);

  // Update the useEffect for template changes
  useEffect(() => {
    const previewData = getTemplatePreviewData(testEmail.template, emailTemplateOptions);
    if (previewData) {
      setTestEmail(prev => ({
        ...prev,
        customData: previewData.data
      }));
    }
  }, [testEmail.template, emailTemplateOptions]);

  // Update the initialization useEffect
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchEmailLogs(),
        fetchScheduledEmails(),
        fetchTemplates(),
        fetchSmtpSettings(),
        fetchResendSettings()
      ]);
    };

    initializeData();
  }, [
    fetchEmailLogs,
    fetchScheduledEmails,
    fetchTemplates,
    fetchSmtpSettings,
    fetchResendSettings
  ]);

  // Fix the unused expressions in the JSX
  const handleTemplateChange = (e) => {
    setTestEmail(prev => ({
      ...prev,
      template: e.target.value
    }));
  };

  // Add this function to show a banner toast
  const showBannerToast = (message, type = 'success') => {
    setBannerToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setBannerToast({ show: false, message: '', type: '' });
    }, 5000);
  };
  
  // Then replace the toast calls in sendTestEmail function
  const sendTestEmail = async () => {
    if (!testEmail.to) {
      showBannerToast('Please enter a recipient email', 'error');
      return;
    }

    try {
      setIsLoading(true);
      console.log("Sending test email with data:", testEmail);
      
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail.to,
          subject: "SMTP Test Email",
          text: "This is a test email sent from your SMTP configuration.",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #4F46E5;">SMTP Test Email</h2>
              <p>This is a test email sent from your SMTP configuration.</p>
              <p>If you received this email, your SMTP settings are working correctly!</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          `
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to send test email');
      }
      
      showBannerToast('Test email sent successfully');
      await fetchEmailLogs(); // This will now update the stats
    } catch (error) {
      console.error('Error sending test email:', error);
      showBannerToast(error.message, 'error');
      await fetchEmailLogs(); // Refresh logs even on failure to update failed count
    } finally {
      setIsLoading(false);
    }
  };
  
  const scheduleEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/emails/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduledEmail),
      });
      
      if (response.ok) {
        toast.success('Email scheduled successfully');
        fetchScheduledEmails();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to schedule email');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      toast.error('Failed to schedule email');
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelScheduledEmail = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/emails/scheduled/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Scheduled email cancelled');
        fetchScheduledEmails();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cancel scheduled email');
      }
    } catch (error) {
      console.error('Error cancelling scheduled email:', error);
      toast.error('Failed to cancel scheduled email');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this for debugging
  useEffect(() => {
    console.log("Current templates:", templates);
    console.log("Current testEmail:", testEmail);
  }, [templates, testEmail]);

  // Add this debugging effect to monitor state changes
  useEffect(() => {
    console.log("Current testEmail state:", testEmail);
  }, [testEmail]);

  // Modify the refresh button click handler
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchEmailLogs();
      if (refreshData) {
        await refreshData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToastDismiss = () => {
    setBannerToast({ show: false, message: '', type: '' });
  };

  // Add these handler functions before the return statement
  const handleSettingsReset = () => {
    if (emailProvider === 'smtp') {
      fetchSmtpSettings();
    } else {
      fetchResendSettings();
    }
  };

  const handleSettingsSave = async () => {
    try {
      setIsLoading(true);
      if (emailProvider === 'smtp') {
        const response = await fetch('/api/admin/emails/smtp-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smtpSettings)
        });
        
        if (!response.ok) throw new Error('Failed to save SMTP settings');
        showBannerToast('SMTP settings saved successfully');
      } else {
        const response = await fetch('/api/admin/emails/resend-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resendSettings)
        });
        
        if (!response.ok) throw new Error('Failed to save Resend settings');
        showBannerToast('Resend settings saved successfully');
      }
    } catch (error) {
      showBannerToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-gray-400">Send, schedule, and manage system emails</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.sent || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total emails sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.scheduled || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Emails waiting to be sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.failed || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Delivery failures</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs 
        defaultValue="test-emails" 
        value={selectedTab} 
        onValueChange={setSelectedTab} 
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="test-emails">Send Test Email</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Emails</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-emails">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test email to verify your email configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Email Template</Label>
                <select
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  value={testEmail.template}
                  onChange={handleTemplateChange}
                >
                  {emailTemplateOptions.map(template => (
                    <option 
                      key={template.id} 
                      value={template.id}
                      className="bg-background text-foreground"
                    >
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Email */}
              <div className="space-y-2">
                <Label>Test Recipient Email</Label>
                <Input
                  type="email"
                  placeholder="Enter recipient email"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail(prev => ({
                    ...prev,
                    to: e.target.value
                  }))}
                  className="bg-background border-input"
                />
              </div>

              {/* Template Data Preview */}
              <div className="space-y-2">
                <Label>Template Data Preview</Label>
                <pre className="p-4 rounded-md bg-muted text-sm overflow-auto border border-border">
                  {JSON.stringify(testEmail.customData, null, 2)}
                </pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant="default"
                onClick={sendTestEmail}
                disabled={isLoading || !testEmail.to}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Emails</CardTitle>
              <CardDescription>
                Schedule emails to be sent at a specific date and time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleTemplate">Template</Label>
                <select
                  id="scheduleTemplate"
                  className="w-full bg-gray-800 border-gray-700 rounded-md px-3 py-2 text-white"
                  value={scheduledEmail.template}
                  onChange={(e) => setScheduledEmail({...scheduledEmail, template: e.target.value})}
                >
                  {emailTemplateOptions.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipients</Label>
                <select
                  id="recipientType"
                  className="w-full bg-gray-800 border-gray-700 rounded-md px-3 py-2 text-white"
                  value={scheduledEmail.recipientType}
                  onChange={(e) => setScheduledEmail({...scheduledEmail, recipientType: e.target.value})}
                >
                  <option value="all-users">All Users</option>
                  <option value="djs-only">DJs Only</option>
                  <option value="new-users">New Users (Last 30 days)</option>
                  <option value="inactive-users">Inactive Users</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date"
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledEmail.scheduledDate}
                    onChange={e => setScheduledEmail({...scheduledEmail, scheduledDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time"
                    type="time" 
                    value={scheduledEmail.scheduledTime}
                    onChange={e => setScheduledEmail({...scheduledEmail, scheduledTime: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Preview</Button>
              <Button onClick={scheduleEmail} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Email
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Scheduled Emails</h3>
            {scheduledEmails.length === 0 ? (
              <div className="text-center p-6 bg-gray-800/30 rounded-md">
                <Clock className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No emails scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledEmails.map((email) => (
                  <Card key={email.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{email.templateName}</CardTitle>
                        <Badge variant={email.status === 'pending' ? 'outline' : 'secondary'}>
                          {email.status}
                        </Badge>
                      </div>
                      <CardDescription>{email.recipientType}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm">
                        <span>Scheduled: {new Date(email.scheduledTime).toLocaleString()}</span>
                        <span>Recipients: ~{email.recipientCount}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex space-x-2 w-full justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelScheduledEmail(email.id)}
                          disabled={isLoading || email.status !== 'pending'}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>
                View all emails sent from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by email or subject..."
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="ml-2">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : emailLogs.length === 0 ? (
                <div className="text-center p-8 bg-gray-800/30 rounded-md">
                  <Mail className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No email logs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border border-gray-700 rounded-md hover:bg-gray-800/50"
                    >
                      <div className="flex items-center">
                        {log.status === 'sent' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        <div>
                          <div className="font-medium">{log.recipient}</div>
                          <div className="text-sm text-gray-400">{log.subject}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          {new Date(log.sentAt).toLocaleString()}
                        </div>
                        <Badge variant={log.status === 'sent' ? 'success' : 'destructive'} className="mt-1">
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-400">
                Showing {emailLogs.length} of {emailLogs.length} logs
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Provider Configuration</CardTitle>
              <CardDescription>Configure your email service provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Provider Selection */}
                <div className="space-y-4">
                  <Label>Email Provider</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EMAIL_PROVIDERS.map(provider => (
                      <Button
                        key={provider.id}
                        variant={emailProvider === provider.id ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setEmailProvider(provider.id)}
                      >
                        {provider.id === 'smtp' ? (
                          <Server className="mr-2 h-4 w-4" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        {provider.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* SMTP Settings */}
                {emailProvider === 'smtp' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label>Enable SMTP</Label>
                        <p className="text-sm text-gray-500">
                          Use SMTP server for sending emails
                        </p>
                      </div>
                      <Switch
                        checked={smtpSettings.isEnabled}
                        onCheckedChange={(checked) => {
                          setSmtpSettings(prev => ({ ...prev, isEnabled: checked }));
                          if (checked) {
                            setResendSettings(prev => ({ ...prev, isEnabled: false }));
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtp-host">SMTP Host</Label>
                          <Input
                            id="smtp-host"
                            placeholder="smtp.gmail.com"
                            value={smtpSettings.host}
                            onChange={(e) => 
                              setSmtpSettings(prev => ({ ...prev, host: e.target.value }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtp-port">Port</Label>
                          <Input
                            id="smtp-port"
                            type="number"
                            placeholder="587"
                            value={smtpSettings.port}
                            onChange={(e) => 
                              setSmtpSettings(prev => ({ ...prev, port: e.target.value }))
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="smtp-secure"
                            checked={smtpSettings.secure}
                            onCheckedChange={(checked) =>
                              setSmtpSettings(prev => ({ ...prev, secure: checked }))
                            }
                          />
                          <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="smtp-user">Username</Label>
                          <Input
                            id="smtp-user"
                            placeholder="user@example.com"
                            value={smtpSettings.user}
                            onChange={(e) =>
                              setSmtpSettings(prev => ({ ...prev, user: e.target.value }))
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="smtp-password">Password</Label>
                          <Input
                            id="smtp-password"
                            type="password"
                            placeholder="••••••••"
                            value={smtpSettings.password}
                            onChange={(e) =>
                              setSmtpSettings(prev => ({ ...prev, password: e.target.value }))
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="smtp-from">From Address</Label>
                          <Input
                            id="smtp-from"
                            placeholder="noreply@yourdomain.com"
                            value={smtpSettings.from}
                            onChange={(e) =>
                              setSmtpSettings(prev => ({ ...prev, from: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend Settings */}
                {emailProvider === 'resend' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label>Enable Resend</Label>
                        <p className="text-sm text-gray-500">
                          Use Resend.com for sending emails
                        </p>
                      </div>
                      <Switch
                        checked={resendSettings.isEnabled}
                        onCheckedChange={(checked) => {
                          setResendSettings(prev => ({ ...prev, isEnabled: checked }));
                          if (checked) {
                            setSmtpSettings(prev => ({ ...prev, isEnabled: false }));
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resend-api-key">API Key</Label>
                        <Input
                          id="resend-api-key"
                          type="password"
                          placeholder="re_..."
                          value={resendSettings.apiKey}
                          onChange={(e) =>
                            setResendSettings(prev => ({ ...prev, apiKey: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resend-from">From Email</Label>
                        <Input
                          id="resend-from"
                          type="email"
                          placeholder="noreply@yourdomain.com"
                          value={resendSettings.fromEmail}
                          onChange={(e) =>
                            setResendSettings(prev => ({ ...prev, fromEmail: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleSettingsReset}
              >
                Reset
              </Button>
              <Button 
                onClick={handleSettingsSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Test Connection Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Test Connection</CardTitle>
              <CardDescription>
                Verify your email provider settings by sending a test email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email to receive test"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={sendTestEmail}
                disabled={isLoading || (!smtpSettings.isEnabled && !resendSettings.isEnabled)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Banner Toast */}
      {bannerToast.show && (
        <div 
          className={`fixed bottom-4 right-4 left-4 md:top-16 md:left-auto md:bottom-auto md:w-96 p-4 rounded-lg shadow-lg z-50 
            ${bannerToast.type === 'success' 
              ? 'bg-emerald-600 dark:bg-emerald-800' 
              : 'bg-destructive dark:bg-destructive'}`}
          style={{ animation: 'slide-in-right 0.5s ease-out' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {bannerToast.type === 'success' 
                ? <CheckCircle className="h-5 w-5 mr-2 text-emerald-200" /> 
                : <AlertTriangle className="h-5 w-5 mr-2 text-destructive-foreground" />}
              <p className="font-medium text-white dark:text-white">
                {bannerToast.message}
              </p>
            </div>
            <button 
              onClick={handleToastDismiss}
              className="ml-4 text-white/80 hover:text-white transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 