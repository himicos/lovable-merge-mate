
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Check, X } from "lucide-react";

// Sample messages data for demo
const sampleMessages = [
  {
    id: "1",
    subject: "Project Update Meeting",
    sender: "Sarah Johnson",
    time: "10:30 AM",
    type: "email",
    isSelected: true,
  },
  {
    id: "2",
    subject: "Design Review Feedback",
    sender: "Mike Chen",
    time: "Yesterday",
    type: "slack",
    isSelected: false,
  },
  {
    id: "3",
    subject: "Weekly Team Standup",
    sender: "Team Calendar",
    time: "Tomorrow",
    type: "teams",
    isSelected: false,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [messages, setMessages] = useState(sampleMessages);

  // Icon component for message types
  const IconForType = ({ type }: { type: string }) => {
    switch (type) {
      case "email":
        return <Mail size={18} className="text-blue-500" />;
      case "slack":
        return <MessageSquare size={18} className="text-purple-500" />;
      case "teams":
        return <MessageSquare size={18} className="text-indigo-500" />;
      default:
        return <Mail size={18} className="text-gray-500" />;
    }
  };

  const handleMessageSelect = (id: string) => {
    setMessages(messages.map(msg => ({
      ...msg,
      isSelected: msg.id === id
    })));
  };

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
    <div className="p-6 bg-background">
      {/* Header Section */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{greeting}</h1>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card - Takes up 2/3 of the grid on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-app-card rounded-xl p-5 shadow-sm flex justify-between items-center border border-primary/10">
            <div>
              <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Welcome to Verby</h2>
              <p className="text-muted-foreground mt-1">
                Connect your email, Slack, and Teams accounts to get started with AI-powered message management.
              </p>
            </div>
            <img 
              src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png" 
              alt="Verby Logo" 
              className="w-16 h-16 object-contain" 
            />
          </div>
        </div>

        {/* Onboarding Card - Takes up 1/3 of the grid on large screens */}
        {showOnboarding && (
          <div className="relative">
            <div className="bg-app-card rounded-xl p-4 shadow-md h-full border border-primary/10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Onboarding</h3>
                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="text-muted-foreground hover:text-gray-800 dark:hover:text-gray-100 text-lg"
                  aria-label="Close onboarding"
                >
                  ×
                </button>
              </div>
              <ul className="text-sm text-gray-800 dark:text-gray-100 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="bg-primary p-1 rounded-full">
                    <Check size={14} className="text-primary-foreground" />
                  </span>
                  <span>Connect your email</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-primary p-1 rounded-full">
                    <Check size={14} className="text-primary-foreground" />
                  </span>
                  <span>Complete your profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-muted p-1 rounded-full">
                    <span className="block w-2 h-2 bg-primary rounded-full"></span>
                  </span>
                  <span>Set your AI preferences</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Messages List */}
      <div className="bg-app-card rounded-xl p-4 shadow-sm mb-6 border border-primary/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent messages</h3>
          <button className="text-muted-foreground text-sm">Sort <span>⇅</span></button>
        </div>
        
        {messages.length > 0 ? (
          <ul className="space-y-2">
            {messages.map(msg => (
              <li
                key={msg.id}
                onClick={() => handleMessageSelect(msg.id)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${
                  msg.isSelected 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconForType type={msg.type} />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{msg.subject}</p>
                    <p className="text-muted-foreground text-sm">{msg.sender}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-6 text-muted-foreground">No messages to display</p>
        )}
      </div>
      
      {/* Service Status & Summary Button */}
      <div className="flex justify-between items-center mt-4 bg-app-card rounded-xl p-3 shadow-sm border border-primary/10">
        <span className="text-gray-800 dark:text-gray-100 text-sm">
          Services Running <span className="text-muted-foreground">(email scanning)</span>
        </span>
        <button className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          ✨ Summarize
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
