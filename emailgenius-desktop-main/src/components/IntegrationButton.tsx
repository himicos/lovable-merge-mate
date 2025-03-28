
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface IntegrationButtonProps {
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isLoading: boolean;
  onClick: () => void;
  buttonText?: string;
}

const IntegrationButton = ({
  name,
  icon,
  isConnected,
  isLoading,
  onClick,
  buttonText,
}: IntegrationButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={`group w-full h-10 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden
        ${isConnected 
          ? "bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300" 
          : isLoading 
          ? "bg-app-accent/80 text-white cursor-wait hover:bg-app-accent/80" 
          : "bg-app-accent text-white"}`}
    >
      {/* Highlight animation element */}
      {!isConnected && !isLoading && (
        <div className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
      )}
      
      {/* Highlight/glow effect similar to voice input */}
      {!isConnected && !isLoading && (
        <div className="absolute -inset-1 bg-[hsl(var(--accent))]/0 group-hover:bg-[hsl(var(--accent))]/20 rounded-xl blur-md transition-all duration-500 group-hover:duration-200"></div>
      )}
      
      {icon}
      {isLoading ? "Redirecting..." : buttonText || (isConnected ? `${name} Connected` : `Connect ${name}`)}
    </Button>
  );
};

export default IntegrationButton;
