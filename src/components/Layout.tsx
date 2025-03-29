
import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import AIAssistantButton from "./AIAssistantButton";
import { useTheme } from "@/components/ui/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex w-full h-screen overflow-hidden bg-app-background text-foreground`}>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
        <AIAssistantButton />
      </div>
    </div>
  );
};

export default Layout;
