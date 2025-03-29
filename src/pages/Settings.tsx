
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ui/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Slack, MessageSquare } from "lucide-react";
import IntegrationButton from "@/components/IntegrationButton";
import { initiateGmailAuth, checkGmailConnection, disconnectGmail } from "@/lib/gmail";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Integration states
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<{ isConnected: boolean; email?: string | null }>({ 
    isConnected: false,
    email: null
  });
  const [slackLoading, setSlackLoading] = useState(false);
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [isTeamsConnected, setIsTeamsConnected] = useState(false);
  
  // Check connections status on mount
  useEffect(() => {
    if (!user) return;
    
    const checkConnectionStatus = async () => {
      try {
        const status = await checkGmailConnection();
        setGmailStatus(status);
        
        // Check URL params for connection status
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmailConnected') === 'true') {
          toast({
            title: "Gmail Connected",
            description: "Successfully connected your Gmail account!",
          });
          // Refresh connection status after successful connection
          const updatedStatus = await checkGmailConnection();
          setGmailStatus(updatedStatus);
          // Clean up URL
          window.history.replaceState({}, '', '/settings');
        } else if (params.get('error') === 'gmail_connection_failed') {
          toast({
            title: "Connection Failed",
            description: "Failed to connect to Gmail. Please try again.",
            variant: "destructive",
          });
          // Clean up URL
          window.history.replaceState({}, '', '/settings');
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
      }
    };
    
    checkConnectionStatus();
  }, [toast, user]);
  
  // Handle Gmail connection/disconnection
  const handleGmailAction = async () => {
    setGmailLoading(true);
    
    try {
      if (gmailStatus.isConnected) {
        await disconnectGmail();
        setGmailStatus({ isConnected: false, email: null });
        toast({
          title: "Gmail Disconnected",
          description: "Successfully disconnected your Gmail account.",
        });
      } else {
        await initiateGmailAuth();
      }
    } catch (error) {
      console.error('Gmail action error:', error);
      toast({
        title: "Action Failed",
        description: gmailStatus.isConnected
          ? "Failed to disconnect Gmail. Please try again."
          : "Failed to connect Gmail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGmailLoading(false);
    }
  };
  
  // Handle Slack connection
  const connectSlack = async () => {
    setSlackLoading(true);
    
    try {
      // Simulate API delay
      setTimeout(() => {
        toast({
          title: "Slack Authorization",
          description: "You would be redirected to Slack's auth page",
        });
        setSlackLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error connecting Slack:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Slack. Please try again.",
        variant: "destructive",
      });
      setSlackLoading(false);
    }
  };
  
  // Handle Teams connection
  const connectTeams = async () => {
    setTeamsLoading(true);
    
    try {
      // Simulate API delay
      setTimeout(() => {
        toast({
          title: "Microsoft Teams Authorization",
          description: "You would be redirected to Microsoft's auth page",
        });
        setTeamsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error connecting Microsoft Teams:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Microsoft Teams. Please try again.",
        variant: "destructive",
      });
      setTeamsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        {/* Integrations Card - New Section */}
        <Card className="bg-app-card mb-6">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect your accounts to enable app integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Email Integrations</Label>
                <IntegrationButton
                  name={gmailStatus.isConnected ? `Gmail (${gmailStatus.email})` : 'Gmail'}
                  icon={
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img 
                        src="/lovable-uploads/742ec6c8-9191-4098-95a0-72ae1d4c4826.png" 
                        alt="Gmail Logo" 
                        className="w-5 h-4 object-contain"
                      />
                    </div>
                  }
                  isConnected={gmailStatus.isConnected}
                  isLoading={gmailLoading}
                  onClick={handleGmailAction}
                  buttonText={gmailStatus.isConnected ? "Disconnect" : "Connect"}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Messaging Integrations</Label>
                <div className="space-y-2">
                  <IntegrationButton
                    name="Slack"
                    icon={<Slack size={18} className="text-white" />}
                    isConnected={isSlackConnected}
                    isLoading={slackLoading}
                    onClick={connectSlack}
                  />
                  <IntegrationButton
                    name="Microsoft Teams"
                    icon={<MessageSquare size={18} className="text-white" />}
                    isConnected={isTeamsConnected}
                    isLoading={teamsLoading}
                    onClick={connectTeams}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-app-card mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Manage how the dashboard looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">Dark Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch 
                id="theme-toggle" 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-app-card mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifs">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new emails
                  </p>
                </div>
                <Switch id="email-notifs" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-notifs">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming deadlines
                  </p>
                </div>
                <Switch id="task-notifs" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-app-card">
          <CardHeader>
            <CardTitle>AI Assistant Settings</CardTitle>
            <CardDescription>
              Configure how the AI assistant works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Show the AI assistant button on all pages
                  </p>
                </div>
                <Switch id="ai-enabled" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-capture">Voice Capture</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the assistant to listen to voice commands
                  </p>
                </div>
                <Switch id="voice-capture" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-suggestions">Auto Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Let the assistant proactively suggest actions
                  </p>
                </div>
                <Switch id="auto-suggestions" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
