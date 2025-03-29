
import { useState, useEffect, useRef } from "react";
import { Mic, X, Send } from "lucide-react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/hooks/use-theme";

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
    <div className="fixed bottom-4 right-4 z-50">
      {!expanded ? (
        <Button
          onClick={() => setExpanded(true)}
          size="lg"
          className="rounded-full h-14 w-14 flex items-center justify-center bg-accent hover:bg-accent-hover shadow-lg"
        >
          <img 
            src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png"
            alt="Verby Logo"
            className="h-8 w-auto"
          />
        </Button>
      ) : (
        <div className="bg-app-card w-80 rounded-[28px] p-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">AI Assistant</h3>
            <button 
              onClick={() => setExpanded(false)}
              aria-label="Close AI Assistant"
              className="text-muted-foreground hover:text-foreground transition-colors"
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
                      ? "bg-accent text-accent-foreground ml-8" 
                      : "bg-muted text-muted-foreground mr-8"
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs mt-1 text-right opacity-70">
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
              className="resize-none min-h-[40px] p-2 text-sm"
            />
            <Button 
              type="submit" 
              className="h-auto"
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
