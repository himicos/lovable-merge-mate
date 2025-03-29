
import { ReactNode } from "react";

interface EmailCardProps {
  sender: string;
  subject: string;
  snippet: string;
  isNew?: boolean;
  badge?: string | ReactNode;
  onClick?: () => void;
}

const EmailCard = ({ sender, subject, snippet, isNew, badge, onClick }: EmailCardProps) => {
  return (
    <div 
      className="email-card animate-fade-in"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-white">{sender}</h3>
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="text-xs font-medium bg-app-highlight text-black px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          {badge && (
            <span className="text-xs font-medium text-gray-400">
              {badge}
            </span>
          )}
        </div>
      </div>
      <p className="font-medium text-gray-200 mb-1">{subject}</p>
      <p className="text-sm text-gray-400 truncate">{snippet}</p>
    </div>
  );
};

export default EmailCard;
