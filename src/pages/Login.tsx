import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Home, Lock } from "lucide-react";
import { RiGoogleFill } from "@remixicon/react";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = () => {
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2FCE2] text-emerald-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-6">
          <a href="/" className="flex items-center space-x-2 font-medium">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </a>
        </div>
        <div className="h-10 w-32">
          <img 
            src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png"
            alt="Verby Logo"
            className="h-full object-contain"
          />
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column with text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-1">
              <h1 className="text-5xl md:text-6xl font-bold text-verby-light">
                  Less talk, more
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold text-verby-dark">
                  verby
                </h1>
              </div>
              <p className="text-xl text-emerald-700">
                Free yourself from the noise of endless chats, emails, and follow-ups.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-full text-lg">
                  Get Started
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white sm:max-w-md rounded-[28px] border-0 shadow-lg">
                <DialogHeader className="text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d8f3d0]">
                      <svg
                        className="stroke-[#0a8a36]"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
                      </svg>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-[#0a5a36]">
                      Sign in to Verby
                    </DialogTitle>
                    <DialogDescription className="text-[#0a8a36]">
                      Get started with your Verby account
                    </DialogDescription>
                  </div>
                </DialogHeader>
                
                <div className="flex flex-col items-center pt-4 pb-2">
                  <Button 
                    variant="outline" 
                    onClick={handleGoogleSignIn}
                    className="w-full rounded-lg border border-[#d8f3d0] bg-[#F2FCE2] hover:bg-[#e0f8d0] text-[#0a5a36]"
                  >
                    <RiGoogleFill
                      className="mr-2 text-[#DB4437]"
                      size={16}
                      aria-hidden="true"
                    />
                    Sign in with Google
                  </Button>
                  
                  <div className="mt-4 text-center text-sm text-[#0a8a36]">
                    <p>
                      Protected with
                      <Lock className="inline-block h-3 w-3 mx-1" />
                      end-to-end encryption
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Right column with illustration */}
          <div className="relative">
            <img 
              src="/lovable-uploads/3c467d16-5365-45e8-b91f-bd5b96821614.png" 
              alt="Person working on laptop" 
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F8F6D8] py-6 px-4 mt-auto">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="/privacy" className="flex items-center space-x-2 text-emerald-800">
              <Lock className="h-5 w-5" />
              <span>Privacy</span>
            </a>
          </div>
          <div className="mt-4 md:mt-0">
            <img 
              src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png"
              alt="Verby Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
