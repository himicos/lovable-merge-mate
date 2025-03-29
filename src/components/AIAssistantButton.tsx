
import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleAssistant}
        size="lg"
        className="rounded-full h-14 w-14 flex items-center justify-center bg-accent hover:bg-accent-hover shadow-lg"
      >
        <Bot size={24} />
      </Button>
    </div>
  );
};

export default AIAssistantButton;
