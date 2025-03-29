import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Home, Lock, Mail } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";

const Landing = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error, data } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // If it's sign up and we need email verification
        if (isSignUp && !data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a verification link to complete your sign up.",
          });
        } else {
          toast({
            title: "Success!",
            description: isSignUp ? "Account created successfully." : "Welcome back!",
          });
        }
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#d8f3d0] text-[#0a5a36]">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-6">
          <a href="/" className="flex items-center space-x-2 font-medium">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </a>
        </div>
        <div className="h-10">
          <SocialLinks />
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column with text */}
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-[#0a5a36]">
                Less talk,<br />more verby
              </h1>
              <p className="text-xl text-[#0a8a36]">
                Free yourself from the noise of endless chats, emails, and follow-ups.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0a8a36] hover:bg-[#0a5a36] text-white px-8 py-6 rounded-full text-lg">
                  Get Started
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isSignUp ? "Create an account" : "Sign in"}</DialogTitle>
                  <DialogDescription>
                    {isSignUp 
                      ? "Enter your email and create a password to get started." 
                      : "Enter your credentials to access your account."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {!isSignUp && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember">Remember me</Label>
                    </div>
                  )}
                  <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button type="submit" className="w-full bg-[#0a8a36] hover:bg-[#0a5a36]" disabled={isLoading}>
                      {isLoading ? "Processing..." : isSignUp ? "Sign up" : "Sign in"}
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-green-100" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-[#0a8a36]">Or continue with</span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGoogleSignIn}
                      className="w-full"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                        <path
                          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                          fill="#EA4335"
                        />
                        <path
                          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                          fill="#34A853"
                        />
                      </svg>
                      Google
                    </Button>
                  </DialogFooter>
                </form>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-[#0a8a36] hover:underline"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Right column with new illustration */}
          <div className="relative flex justify-center items-center">
            <img 
              src="/lovable-uploads/84a95001-ed3f-44b2-b819-beb8a1eb329a.png" 
              alt="Person working on laptop" 
              className="w-4/5 md:w-full max-w-md mx-auto"
              style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 100, 0, 0.2))" }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-[#f8f3d9] py-6 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="/privacy" className="flex items-center space-x-2 text-[#0a5a36]">
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

export default Landing;
