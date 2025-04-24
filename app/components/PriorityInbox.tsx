
import EmailCard from "./EmailCard";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  isNew?: boolean;
  badge?: string;
}

interface PriorityInboxProps {
  emails: Email[];
  title?: boolean;
}

const PriorityInbox = ({ emails, title = true }: PriorityInboxProps) => {
  return (
    <div className="space-y-2">
      {title && (
        <h2 className="text-lg font-semibold uppercase tracking-wide mb-3">Priority Inbox</h2>
      )}
      <div className="space-y-3">
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            sender={email.sender}
            subject={email.subject}
            snippet={email.snippet}
            isNew={email.isNew}
            badge={email.badge}
          />
        ))}
      </div>
    </div>
  );
};

export default PriorityInbox;
