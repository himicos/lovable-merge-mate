
import { LucideLayoutGrid, LucideUser, LucideSettings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const { theme } = useTheme();

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

  // Determine colors based on theme
  const bgColor = theme === 'light' ? 'bg-white border-r border-gray-200' : 'bg-[#1E1E1E] border-r border-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-gray-200';
  const activeItemBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-800';
  const hoverBg = theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-700';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';

  return (
    <div className={`w-[300px] h-screen ${bgColor} p-6 flex flex-col`}>
      {/* Logo - increased size by 5x */}
      <div className="flex items-center justify-center mb-12">
        <img 
          src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png" 
          alt="Verby Logo" 
          className="w-80 h-80 object-contain" 
        />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${textColor} ${
                currentPath === "/" ? activeItemBg + " font-medium" : hoverBg + " transition-colors"
              }`}
            >
              <LucideLayoutGrid size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${textColor} ${
                currentPath === "/settings" ? activeItemBg + " font-medium" : hoverBg + " transition-colors"
              }`}
            >
              <LucideSettings size={18} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${textColor} ${
                currentPath === "/profile" ? activeItemBg + " font-medium" : hoverBg + " transition-colors"
              }`}
            >
              <LucideUser size={18} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={handleSignOut} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${textColor} ${hoverBg} transition-colors text-left`}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className={`flex items-center gap-3 pt-4 border-t ${borderColor}`}>
        <Avatar className={`w-10 h-10 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} ${textColor}`}>
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <span className={`font-medium ${textColor}`}>{displayName}</span>
      </div>
    </div>
  );
};

export default Sidebar;
