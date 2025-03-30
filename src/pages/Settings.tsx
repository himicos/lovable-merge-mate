
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Slack, MessageSquare, Moon, Sun } from "lucide-react";
import IntegrationButton from "@/components/IntegrationButton";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ui/theme-provider";
import { initiateGmailAuth, checkGmailConnection, disconnectGmail } from "@/lib/gmail";

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

  // Check Gmail connection status on mount
  useEffect(() => {
    const checkGmail = async () => {
      if (user?.id) {
        const status = await checkGmailConnection(user.id);
        setGmailStatus(status);
      }
    };
    checkGmail();
  }, [user]);
  
  // Handle Gmail connection/disconnection
  const handleGmailAction = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Gmail.",
        variant: "destructive"
      });
      return;
    }

    setGmailLoading(true);
    
    try {
      if (gmailStatus.isConnected) {
        await disconnectGmail(user.id);
        setGmailStatus({ isConnected: false, email: null });
        toast({
          title: "Gmail Disconnected",
          description: "Successfully disconnected your Gmail account.",
        });
      } else {
        await initiateGmailAuth();
        // The page will redirect to Google OAuth, so we don't need to handle the success case here
      }
    } catch (error) {
      console.error('Gmail action error:', error);
      toast({
        title: "Error",
        description: "Failed to connect/disconnect Gmail. Please try again.",
        variant: "destructive"
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
        setIsSlackConnected(!isSlackConnected);
        toast({
          title: isSlackConnected ? "Slack Disconnected" : "Slack Connected",
          description: isSlackConnected 
            ? "Successfully disconnected from Slack." 
            : "Successfully connected to Slack!",
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
        setIsTeamsConnected(!isTeamsConnected);
        toast({
          title: isTeamsConnected ? "Teams Disconnected" : "Teams Connected",
          description: isTeamsConnected 
            ? "Successfully disconnected from Microsoft Teams." 
            : "Successfully connected to Microsoft Teams!",
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
      <div className="w-full max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        {/* Appearance Card - Top section */}
        <Card className="bg-app-card rounded-xl shadow-sm border border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Manage how the dashboard looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="theme-toggle">{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' 
                      ? 'Using olive drab dark theme' 
                      : 'Using olive drab light theme'}
                  </p>
                </div>
              </div>
              <Switch 
                id="theme-toggle" 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Integrations Card */}
        <Card className="bg-app-card rounded-xl shadow-sm border border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect your accounts to enable app integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 integration-section">
                <Label className="text-lg font-medium">Email Integrations</Label>
                <IntegrationButton
                  name={gmailStatus.isConnected ? `Gmail (${gmailStatus.email})` : 'Gmail'}
                  icon={
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                  }
                  isConnected={gmailStatus.isConnected}
                  isLoading={gmailLoading}
                  onClick={handleGmailAction}
                  buttonText={gmailStatus.isConnected ? "Disconnect" : "Connect"}
                />
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-primary/10 integration-section">
                <Label className="text-lg font-medium">Messaging Integrations</Label>
                <div className="space-y-3">
                  <IntegrationButton
                    name="Slack"
                    icon={<Slack size={18} />}
                    isConnected={isSlackConnected}
                    isLoading={slackLoading}
                    onClick={connectSlack}
                  />
                  <IntegrationButton
                    name="Microsoft Teams"
                    icon={<MessageSquare size={18} />}
                    isConnected={isTeamsConnected}
                    isLoading={teamsLoading}
                    onClick={connectTeams}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications Card */}
        <Card className="bg-app-card rounded-xl shadow-sm border border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifs" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new emails
                  </p>
                </div>
                <Switch id="email-notifs" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <div className="space-y-0.5">
                  <Label htmlFor="task-notifs" className="font-medium">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming deadlines
                  </p>
                </div>
                <Switch id="task-notifs" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Assistant Settings Card */}
        <Card className="bg-app-card rounded-xl shadow-sm border border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>AI Assistant Settings</CardTitle>
            <CardDescription>
              Configure how the AI assistant works
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-enabled" className="font-medium">Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Show the AI assistant button on all pages
                  </p>
                </div>
                <Switch id="ai-enabled" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-capture" className="font-medium">Voice Capture</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the assistant to listen to voice commands
                  </p>
                </div>
                <Switch id="voice-capture" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-suggestions" className="font-medium">Auto Suggestions</Label>
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
