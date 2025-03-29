
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    
    if (hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour < 18) {
      timeGreeting = "Good afternoon";
    } else {
      timeGreeting = "Good evening";
    }
    
    const name = user?.user_metadata?.name || 
                user?.user_metadata?.full_name || 
                user?.email?.split('@')[0] ||
                "there";
                
    setGreeting(`${timeGreeting}, ${name}`);
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{greeting}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-app-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Welcome to Verby</h2>
          <p className="text-gray-300 mb-4">
            This is a sample dashboard for the Verby application. Connect your email account to get started with AI-powered email management.
          </p>
          <div className="p-4 bg-app-card-secondary rounded-lg text-sm">
            <p>Configure your settings in the Settings tab to connect your email accounts.</p>
          </div>
        </div>
        
        <div className="bg-app-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium">{user?.email || "Not logged in"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Sign In</p>
              <p className="font-medium">
                {user?.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString() 
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-app-card rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">What's Next</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-app-accent/20 p-2 rounded-full text-app-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Connect your email account</h3>
              <p className="text-sm text-gray-400">Link your Gmail or other email provider to enable AI features</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-app-accent/20 p-2 rounded-full text-app-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Complete your profile</h3>
              <p className="text-sm text-gray-400">Add your details to personalize your experience</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-app-accent/20 p-2 rounded-full text-app-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Set email preferences</h3>
              <p className="text-sm text-gray-400">Configure how the AI should handle your emails</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
