
import { useState, useEffect, useRef } from "react";
import { Mic, X, Send } from "lucide-react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/ThemeContext";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

const AIAssistantButton = () => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: "1",
      content: "How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const handleVoiceStart = () => {
    console.log('Voice recording started');
  };
  
  const handleVoiceStop = (duration: number) => {
    console.log(`Voice recording stopped after ${duration} seconds`);
    
    if (duration > 1) { // Only process if recording was longer than 1 second
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const newQuery: Message = {
      id: Date.now().toString(),
      content: query,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, newQuery]);
    
    // Simulate AI response
    setTimeout(() => {
      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'll help you with "${query}". What specific information do you need?`,
        isUser: false,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, mockResponse]);
    }, 1000);
    
    setQuery("");
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <div className={`ai-button ${expanded ? 'expanded' : ''} ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
      {!expanded ? (
        <button 
          onClick={() => setExpanded(true)} 
          className="w-full h-full flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <Mic className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="ai-expanded-content flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="ai-title font-medium">AI Assistant</h3>
            <button 
              onClick={() => setExpanded(false)}
              aria-label="Close AI Assistant"
              className="ai-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat messages container with fixed height and overflow control */}
          <ScrollArea className="flex-1 mb-3 overflow-y-auto max-h-[230px]" type="always">
            <div className="space-y-3 pr-2">
              {chatHistory.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${
                    message.isUser 
                      ? "ai-user-message" 
                      : "ai-assistant-message"
                  }`}
                >
                  <p className="text-sm ai-message-text break-words">{message.content}</p>
                  <p className="text-xs ai-timestamp mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          {/* Voice input moved above the message input */}
          <div className="mb-3">
            <AIVoiceInput 
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
              visualizerBars={12}
              size="default"
              className="w-full"
            />
          </div>
          
          {/* Message input and send button at the bottom - fixed alignment */}
          <form onSubmit={handleSubmit} className="flex items-stretch gap-2 mt-auto">
            <Textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your message..."
              className="resize-none min-h-[40px] p-2 text-sm ai-input"
            />
            <Button 
              type="submit" 
              className="ai-send-btn h-auto"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistantButton;
