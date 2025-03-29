
import { Search } from "lucide-react";
import PriorityInbox from "./PriorityInbox";
import IntegrationCard from "./IntegrationCard";

const slackLogo = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" 
      fill="#E01E5A" 
      className="fill-[#E01E5A] dark:fill-[#E01E5A]" />
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
      fill="#36C5F0" 
      className="fill-[#36C5F0] dark:fill-[#36C5F0]" />
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
      fill="#2EB67D"
      className="fill-[#2EB67D] dark:fill-[#2EB67D]" />
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
      fill="#ECB22E"
      className="fill-[#ECB22E] dark:fill-[#ECB22E]" />
  </svg>
);

const teamsLogo = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
    <circle cx="9" cy="8" r="4" fill="#5059C9"/>
    <path d="M12.4999 14C10.1499 14 8.99992 15.094 8.99992 15.094V16C8.99992 17.656 10.3439 19 11.9999 19H17.9999C19.6559 19 20.9999 17.656 20.9999 16V15.094C20.9999 15.094 19.8499 14 17.4999 14H12.4999Z" fill="#5059C9"/>
    <circle cx="18" cy="8" r="4" fill="#7B83EB"/>
    <path d="M3.99992 14C1.64992 14 0.499924 15.094 0.499924 15.094V16C0.499924 17.656 1.84392 19 3.49992 19H9.49992C11.1559 19 12.4999 17.656 12.4999 16V15.094C12.4999 15.094 11.3499 14 8.99992 14H3.99992Z" fill="#7B83EB"/>
  </svg>
);

const mockEmails = [
  {
    id: "1",
    sender: "Jason Howell",
    subject: "Project update",
    snippet: "Here's the latest update on the project.",
    isNew: true
  },
  {
    id: "2",
    sender: "Sara Allen",
    subject: "Meeting rescheduled",
    snippet: "The meeting has been rescheduled to next week.",
    isNew: false
  },
  {
    id: "3",
    sender: "Tom Benson",
    subject: "Performance review",
    snippet: "Great, that answers my question. Thanks for your time.",
    isNew: false
  }
];

const Dashboard = () => {
  return (
    <div className="flex-1 h-screen p-6 overflow-y-auto">
      {/* Header with Title and Search */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold uppercase tracking-wide">Monitoring</h1>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-app-card border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 w-[280px] focus:outline-none focus:ring-2 focus:ring-app-accent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Integrations Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <IntegrationCard name="Slack" logo={slackLogo} />
        <IntegrationCard name="Teams" logo={teamsLogo} />
      </div>
      
      {/* Priority Inbox */}
      <PriorityInbox emails={mockEmails} />
    </div>
  );
};

export default Dashboard;
