
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
    <div className="w-[300px] h-screen bg-[#3E5C4E] border-r border-[#4a6d5a] p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <img 
          src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png" 
          alt="Verby Logo" 
          className="w-16 h-16 object-contain" 
        />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white ${
                currentPath === "/" ? "bg-[#517c69] font-medium" : "hover:bg-[#4a6d5a] transition-colors"
              }`}
            >
              <LucideLayoutGrid size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white ${
                currentPath === "/settings" ? "bg-[#517c69] font-medium" : "hover:bg-[#4a6d5a] transition-colors"
              }`}
            >
              <LucideSettings size={18} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white ${
                currentPath === "/profile" ? "bg-[#517c69] font-medium" : "hover:bg-[#4a6d5a] transition-colors"
              }`}
            >
              <LucideUser size={18} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={handleSignOut} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#4a6d5a] transition-colors text-left"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#4a6d5a]">
        <Avatar className="w-10 h-10 bg-[#517c69] text-white">
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-white">{displayName}</span>
      </div>
    </div>
  );
};

export default Sidebar;
