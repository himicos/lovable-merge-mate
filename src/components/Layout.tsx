
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import AIAssistantButton from "./AIAssistantButton";
import { useTheme } from "@/hooks/use-theme";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex w-full h-screen overflow-hidden ${theme === 'light' ? 'bg-background' : 'bg-background'}`}>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
        <AIAssistantButton />
      </div>
    </div>
  );
};

export default Layout;
