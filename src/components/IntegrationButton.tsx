
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface IntegrationButtonProps {
  name: string;
  icon: ReactNode;
  isConnected: boolean;
  isLoading?: boolean;
  onClick: () => void;
  buttonText?: string;
}

const IntegrationButton = ({
  name,
  icon,
  isConnected,
  isLoading = false,
  onClick,
  buttonText
}: IntegrationButtonProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-app-card-secondary rounded-lg">
      <div className="flex items-center">
        <div className="w-8 h-8 flex items-center justify-center bg-app-accent/20 rounded-md mr-3">
          {icon}
        </div>
        <span>{name}</span>
      </div>
      <Button
        size="sm"
        variant={isConnected ? "destructive" : "default"}
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : buttonText ? buttonText : (isConnected ? "Disconnect" : "Connect")}
      </Button>
    </div>
  );
};

export default IntegrationButton;
