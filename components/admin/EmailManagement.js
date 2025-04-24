import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Send, Clock, DownloadCloud, RefreshCw, Check, AlertTriangle, 
  Mail, Search, Calendar, Users, FileText, Filter, PlusCircle, 
  MoreHorizontal, ChevronDown, Loader2, CheckCircle, XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmailTypes } from "@/lib/emailTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export default function EmailManagement({ stats, refreshData }) {
  const [selectedTab, setSelectedTab] = useState("test-emails");
  const [isLoading, setIsLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  
  // Test email state
  const [testEmail, setTestEmail] = useState({
    to: "",
    template: EmailTypes.USER_WELCOME,
    customData: {
      userName: "Test User"
    }
  });
  
  // Scheduled email state
  const [scheduledEmail, setScheduledEmail] = useState({
    template: EmailTypes.USER_WELCOME,
    recipientType: "all-users",
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    scheduledTime: "12:00",
    customData: {
      userName: "{user.name}"
    }
  });
  
  // Fetch email logs on component mount
  useEffect(() => {
    fetchEmailLogs();
    fetchScheduledEmails();
    fetchTemplates();
  }, []);
  
  const fetchEmailLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/emails/logs');
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      toast.error('Failed to fetch email logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTemplates = async () => {
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
  };
  
  const fetchScheduledEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails/scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduledEmails(data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled emails:', error);
    }
  };
  
  const sendTestEmail = async () => {
    if (!testEmail.to) {
      toast.error('Please enter a recipient email');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmail),
      });
      
      if (response.ok) {
        toast.success('Test email sent successfully');
        fetchEmailLogs();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
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
  
  // Update the template selection with proper debugging
  const handleTemplateChange = (value) => {
    console.log("Template selected:", value);
    setTestEmail(prev => ({
      ...prev,
      template: value
    }));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-gray-400">Send, schedule, and manage system emails</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-500" />
              Sent Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emailStats?.sent || 0}</div>
            <p className="text-sm text-gray-400">Total emails sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-500" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emailStats?.scheduled || 0}</div>
            <p className="text-sm text-gray-400">Emails waiting to be sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emailStats?.failed || 0}</div>
            <p className="text-sm text-gray-400">Delivery failures</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="test-emails" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="test-emails">Send Test Email</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Emails</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-emails">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test email using any of the system email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email</Label>
                <Input 
                  id="recipient"
                  type="email" 
                  placeholder="Email address" 
                  value={testEmail.to}
                  onChange={e => setTestEmail({...testEmail, to: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={testEmail.template} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id="template" className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {templates && templates.length > 0 ? (
                      templates.map(template => (
                        <SelectItem key={template.id} value={template.id} className="text-white hover:bg-gray-700">
                          {template.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No templates available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Template Data</Label>
                <div className="p-4 bg-gray-800/50 rounded-md">
                  <div className="space-y-2">
                    {testEmail.template === EmailTypes.USER_WELCOME && (
                      <div>
                        <Label htmlFor="userName">User Name</Label>
                        <Input
                          id="userName"
                          value={testEmail.customData.userName}
                          onChange={e => setTestEmail({
                            ...testEmail,
                            customData: {
                              ...testEmail.customData,
                              userName: e.target.value
                            }
                          })}
                        />
                      </div>
                    )}
                    
                    {testEmail.template === EmailTypes.BID_CREATED && (
                      <>
                        <div>
                          <Label htmlFor="userName">User Name</Label>
                          <Input
                            id="userName"
                            value={testEmail.customData.userName || "Test User"}
                            onChange={e => setTestEmail({
                              ...testEmail,
                              customData: {
                                ...testEmail.customData,
                                userName: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="amount">Bid Amount</Label>
                          <Input
                            id="amount"
                            value={testEmail.customData.amount || "25.00"}
                            onChange={e => setTestEmail({
                              ...testEmail,
                              customData: {
                                ...testEmail.customData,
                                amount: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="songTitle">Song Title</Label>
                          <Input
                            id="songTitle"
                            value={testEmail.customData.songTitle || "Test Song"}
                            onChange={e => setTestEmail({
                              ...testEmail,
                              customData: {
                                ...testEmail.customData,
                                songTitle: e.target.value
                              }
                            })}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Add similar sections for other email types with their specific fields */}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={sendTestEmail} disabled={isLoading} className="w-full">
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
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={scheduledEmail.template}
                  onValueChange={value => setScheduledEmail({...scheduledEmail, template: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipients</Label>
                <Select 
                  value={scheduledEmail.recipientType}
                  onValueChange={value => setScheduledEmail({...scheduledEmail, recipientType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-users">All Users</SelectItem>
                    <SelectItem value="djs-only">DJs Only</SelectItem>
                    <SelectItem value="new-users">New Users (Last 30 days)</SelectItem>
                    <SelectItem value="inactive-users">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
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
      </Tabs>
    </div>
  );
} 