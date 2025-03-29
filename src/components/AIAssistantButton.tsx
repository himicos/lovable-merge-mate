
import { useState } from "react";
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
        <img 
          src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png"
          alt="Verby Logo"
          className="h-8 w-auto"
        />
      </Button>
    </div>
  );
};

export default AIAssistantButton;
