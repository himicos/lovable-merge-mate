
import { LucideLayoutGrid, LucideUser, LucideSettings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

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
            <Link to="/" className={`nav-item ${currentPath === "/" ? "active" : ""}`}>
              <LucideLayoutGrid size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`nav-item ${currentPath === "/settings" ? "active" : ""}`}>
              <LucideSettings size={18} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`nav-item ${currentPath === "/profile" ? "active" : ""}`}>
              <LucideUser size={18} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <button className="nav-item w-full text-left">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gray-700 text-white">MB</AvatarFallback>
        </Avatar>
        <span className="font-medium">Maria Brown</span>
      </div>
    </div>
  );
};

export default Sidebar;
