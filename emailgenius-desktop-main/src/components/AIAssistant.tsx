
import { useState } from "react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";

interface AIAssistantProps {
  onQuery?: (query: string) => void;
}

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

const AIAssistant = ({ onQuery }: AIAssistantProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  
  // Sample chat history for demonstration
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: "1",
      content: "I've analyzed your emails. You have 3 priority messages that need attention.",
      isUser: false,
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: "2",
      content: "Can you summarize the project update from Jason?",
      isUser: true,
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      id: "3",
      content: "Jason's update mentions new mockups for the product redesign. The deadline is next Friday and he needs your feedback by Wednesday.",
      isUser: false,
      timestamp: new Date(Date.now() - 1500000) // 25 minutes ago
    }
  ]);
  
  const handleVoiceStart = () => {
    console.log('Voice recording started');
  };
  
  const handleVoiceStop = (duration: number) => {
    console.log(`Voice recording stopped after ${duration} seconds`);
    
    if (duration > 1) { // Only process if recording was longer than 1 second
      if (onQuery) onQuery("show me my emails");
      
      // Add the query and a mock response to chat history
      const newQuery: Message = {
        id: Date.now().toString(),
        content: "Show me my emails",
        isUser: true,
        timestamp: new Date()
      };
      
      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I found 3 new emails in your inbox. Would you like me to summarize them?",
        isUser: false,
        timestamp: new Date(Date.now() + 1000)
      };
      
      setChatHistory(prev => [...prev, newQuery, mockResponse]);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="w-[380px] h-screen bg-app-background border-l border-white/10 p-6 flex flex-col overflow-hidden">
      {/* User Avatar */}
      <div className="flex justify-end mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
          <img 
            src="/lovable-uploads/713aa10c-75a2-4fb2-a0f8-9816e1cb2f57.png" 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* AI Assistant Voice Interface */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-4">How can I assist you?</h2>
        
        <AIVoiceInput 
          onStart={handleVoiceStart}
          onStop={handleVoiceStop}
          visualizerBars={30}
          className="mb-2"
          size="large"
        />
      </div>
      
      {/* AI Chat Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide">AI Assistant</h2>
          
          <div className="flex gap-4">
            <button 
              className={`font-medium pb-1 border-b-2 transition-colors ${
                activeTab === "chat" 
                  ? "border-white text-white" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            <button 
              className={`font-medium pb-1 border-b-2 transition-colors ${
                activeTab === "history" 
                  ? "border-white text-white" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {activeTab === "chat" && (
            <div className="space-y-4">
              {chatHistory.slice(-3).map((message) => (
                <div key={message.id} className={`p-3 rounded-lg ${
                  message.isUser 
                    ? "bg-app-accent/20 ml-6" 
                    : "bg-app-card mr-6"
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-app-card">
                <h3 className="font-medium mb-1">Email Analysis - July 14</h3>
                <p className="text-sm text-gray-300">3 priority emails identified</p>
              </div>
              <div className="p-3 rounded-lg bg-app-card">
                <h3 className="font-medium mb-1">Meeting Notes - July 13</h3>
                <p className="text-sm text-gray-300">Project timeline discussion</p>
              </div>
              <div className="p-3 rounded-lg bg-app-card">
                <h3 className="font-medium mb-1">Task Summary - July 12</h3>
                <p className="text-sm text-gray-300">5 completed, 3 pending</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
