
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Inbox, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div 
      className={cn(
        "bg-sidebar h-screen transition-all",
        collapsed ? "w-20" : "w-64",
        isMobile && "fixed z-50",
        isMobile && collapsed && "-translate-x-full",
        className
      )}
    >
      {/* Sidebar content */}
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center mb-8">
          <h1 className={cn(
            "font-bold text-2xl transition-opacity",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Email<span className="text-app-accent">Genius</span>
          </h1>
          <Button 
            variant="ghost"
            size="sm"
            className={cn(
              "ml-auto p-2",
              collapsed && "ml-0"
            )}
            onClick={toggleSidebar}
          >
            {collapsed ? "→" : "←"}
          </Button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <SidebarItem 
              to="/" 
              icon={<Inbox size={22} />} 
              label="Dashboard" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/profile" 
              icon={<User size={22} />} 
              label="Profile" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/settings" 
              icon={<Settings size={22} />} 
              label="Settings" 
              collapsed={collapsed} 
            />
          </ul>
        </nav>
        
        <div className="mt-auto">
          {/* Footer content if needed */}
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const SidebarItem = ({ to, icon, label, collapsed }: SidebarItemProps) => {
  return (
    <li>
      <Link 
        to={to} 
        className="flex items-center p-3 rounded-lg hover:bg-app-hover transition-colors"
      >
        <span className="text-gray-400">{icon}</span>
        <span className={cn(
          "ml-3 text-gray-300 transition-all",
          collapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          {label}
        </span>
      </Link>
    </li>
  );
};

export default Sidebar;
