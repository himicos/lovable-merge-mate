
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
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <img 
          src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png" 
          alt="Logo" 
          className="w-12 h-12 md:w-16 md:h-16 object-contain" /* Increased size */
        />
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
