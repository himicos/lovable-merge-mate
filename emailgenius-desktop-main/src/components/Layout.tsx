
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import AIAssistantButton from "./AIAssistantButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-app-background text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
        <AIAssistantButton />
      </div>
    </div>
  );
};

export default Layout;
