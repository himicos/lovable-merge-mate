import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Home, Lock, Mail, Heart } from "lucide-react";
import { RiGoogleFill } from "@remixicon/react";
import { SocialLinks } from "@/components/SocialLinks";
import { useIsMobile } from "@/hooks/use-mobile";
const Landing = () => {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle
  } = useAuth();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error,
        data
      } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // If it's sign up and we need email verification
        if (isSignUp && !data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a verification link to complete your sign up."
          });
        } else {
          toast({
            title: "Success!",
            description: isSignUp ? "Account created successfully." : "Welcome back!"
          });
        }
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
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
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-[#d8f3d0] text-[#0a5a36]">
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
              <div className="space-y-1">
                <h1 className="text-5xl font-bold text-green-800 md:text-7xl">
                  Less talk,
                </h1>
                <h1 className="text-5xl font-bold text-green-600 md:text-6xl">
                  more verby
                </h1>
              </div>
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
              <DialogContent className="bg-white sm:max-w-md rounded-xl border-0 shadow-lg">
                <DialogHeader>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d8f3d0]">
                      <svg className="stroke-[#0a8a36]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
                        <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
                      </svg>
                    </div>
                    <DialogTitle className="text-center text-xl font-semibold">
                      {isSignUp ? "Create an account" : "Welcome back"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      {isSignUp ? "Sign up to get started with Verby." : "Enter your credentials to access your account."}
                    </DialogDescription>
                  </div>
                </DialogHeader>
                
                {/* Login Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="pl-10 rounded-lg" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pl-10 rounded-lg" required />
                    </div>
                  </div>
                  {!isSignUp && <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember">Remember me</Label>
                    </div>}
                  <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button type="submit" className="w-full bg-[#0a8a36] hover:bg-[#0a5a36] rounded-lg" disabled={isLoading}>
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
                    <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full rounded-lg">
                      <RiGoogleFill className="mr-2 text-[#DB4437]" size={16} aria-hidden="true" />
                      Google
                    </Button>
                  </DialogFooter>
                </form>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#0a8a36] hover:underline">
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Right column with new illustration */}
          <div className="relative flex justify-center items-center">
            <img src="/lovable-uploads/84a95001-ed3f-44b2-b819-beb8a1eb329a.png" alt="Person working on laptop" className="w-4/5 md:w-full max-w-md mx-auto" style={{
            filter: "drop-shadow(0px 10px 15px rgba(0, 100, 0, 0.2))"
          }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-[#f8f3d9] py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <a href="/privacy" className="flex items-center space-x-2 text-[#0a5a36]">
                <Lock className="h-5 w-5" />
                <span>Privacy</span>
              </a>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <img src="/lovable-uploads/f8a6b778-8fc7-4cbd-82c8-3cd01d5899e6.png" alt="Verby Logo" className="h-12 w-auto" />
              <div className="flex items-center text-sm text-[#0a5a36]">
                <span>All rights reserved. Verby. Made with </span>
                <Heart className="h-4 w-4 mx-1 text-red-500 fill-red-500" />
                <span>Lovable 2025</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;