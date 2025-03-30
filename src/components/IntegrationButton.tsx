
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntegrationButtonProps {
  name: string;
  icon: ReactNode;
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
  buttonText
}: IntegrationButtonProps) => {
  return (
    <Button
      variant={isConnected ? "secondary" : "default"}
      className={`w-full justify-between ${
        isConnected 
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white" 
          : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-accent dark:text-white dark:hover:bg-accent/90"
      }`}
      onClick={onClick}
      disabled={isLoading}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{name}</span>
      </div>
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span className="text-xs">
          {buttonText || (isConnected ? "Connected" : "Connect")}
        </span>
      )}
    </Button>
  );
};

export default IntegrationButton;
