
import { ReactNode } from "react";

interface IntegrationCardProps {
  name: string;
  logo: ReactNode;
  onClick?: () => void;
}

const IntegrationCard = ({ name, logo, onClick }: IntegrationCardProps) => {
  return (
    <div 
      className="app-card flex items-center gap-4 cursor-pointer" 
      onClick={onClick}
    >
      <div className="w-10 h-10 flex-shrink-0">
        {logo}
      </div>
      <span className="text-lg font-medium">{name}</span>
    </div>
  );
};

export default IntegrationCard;
