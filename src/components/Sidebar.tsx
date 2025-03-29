
import { LucideLayoutGrid, LucideUser, LucideSettings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "@/hooks/use-toast";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-[300px] h-screen bg-app-background border-r border-white/10 p-6 flex flex-col">
      {/* Logo and App Title */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-full bg-transparent border-2 border-white flex items-center justify-center">
          <div className="w-5 h-5 bg-black rounded-full"></div>
        </div>
        <h1 className="text-xl font-semibold">AI Assistant</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link to="/" className={`nav-item ${currentPath === "/" ? "active rounded-lg" : ""}`}>
              <LucideLayoutGrid size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`nav-item ${currentPath === "/settings" ? "active rounded-lg" : ""}`}>
              <LucideSettings size={18} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`nav-item ${currentPath === "/profile" ? "active rounded-lg" : ""}`}>
              <LucideUser size={18} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <button onClick={handleSignOut} className="nav-item w-full text-left">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gray-700 text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{displayName}</span>
      </div>
    </div>
  );
};

export default Sidebar;
