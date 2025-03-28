
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SplineScene } from "@/components/ui/spline-scene";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";
import { toast } from "@/hooks/use-toast";

const Landing = () => {
  const id = useId();
  const { user, signIn, signInWithGoogle, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
      } else {
        await signIn(email, password);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google authentication error:", error);
      toast({
        title: "Google authentication failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-app-background flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="flex-1 p-8 flex flex-col justify-center items-start z-10">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
            Let me handle your emails.
          </h1>
          <p className="text-lg text-gray-300 max-w-lg mb-8">
            Our AI-powered assistant manages your inbox, prioritizes important messages, and helps you stay on top of your communication.
          </p>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
                  aria-hidden="true"
                >
                  <svg
                    className="stroke-zinc-800 dark:stroke-zinc-100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
                  </svg>
                </div>
                <DialogHeader>
                  <DialogTitle className="sm:text-center">
                    {isSignUp ? "Create an account" : "Welcome back"}
                  </DialogTitle>
                  <DialogDescription className="sm:text-center">
                    {isSignUp 
                      ? "Sign up to get started with your email assistant." 
                      : "Enter your credentials to login to your account."}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${id}-email`}>Email</Label>
                    <Input 
                      id={`${id}-email`} 
                      placeholder="hi@yourcompany.com" 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${id}-password`}>Password</Label>
                    <Input
                      id={`${id}-password`}
                      placeholder="Enter your password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                {!isSignUp && (
                  <div className="flex justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`${id}-remember`}
                        checked={remember}
                        onCheckedChange={(checked) => 
                          setRemember(checked === true)
                        }
                      />
                      <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    <a className="text-sm underline hover:no-underline" href="#">
                      Forgot password?
                    </a>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : isSignUp ? "Sign up" : "Sign in"}
                </Button>
              </form>

              <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                <span className="text-xs text-muted-foreground">Or</span>
              </div>

              <Button variant="outline" onClick={handleGoogleSignIn} type="button">
                Login with Google
              </Button>

              <div className="text-center text-sm">
                {isSignUp ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="underline font-medium hover:text-primary"
                      onClick={() => setIsSignUp(false)}
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="underline font-medium hover:text-primary"
                      onClick={() => setIsSignUp(true)}
                    >
                      Create one
                    </button>
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Right side - 3D model */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
