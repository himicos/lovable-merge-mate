
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, User, Settings, Menu, X, Mail, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMobile();
  
  const toggleSidebar = () => {
    setOpen(!open);
  };
  
  const links = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];
  
  // Close sidebar when clicking outside of it on mobile
  const handleOutsideClick = () => {
    if (isMobile && open) {
      setOpen(false);
    }
  };
  
  return (
    <>
      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-white w-64 flex-shrink-0 border-r border-app-border transition-all duration-300 ease-in-out z-40 h-screen fixed lg:relative",
          isMobile ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        )}
      >
        <div className="p-4 flex items-center space-x-2">
          <Mail size={24} className="text-app-accent" />
          <span className="text-xl font-bold">EmailGenius</span>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => isMobile && setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-gray-400 hover:text-white hover:bg-sidebar-hover"
                  )
                }
              >
                <span className="mr-3">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      
      {/* Overlay to close sidebar when clicking outside */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={handleOutsideClick}
        />
      )}
    </>
  );
};

export default Sidebar;
