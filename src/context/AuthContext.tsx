
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

import { supabase } from '@/services/api/auth';

type AuthContextType = {
  user: User | null;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();

        // Handle auth callback if we're on the callback page
        if (location.pathname === '/auth/callback') {
          if (error) {
            console.error('Auth callback error:', error);
            throw error;
          }
          if (session) {
            console.log('Auth callback successful');
            navigate('/');
            return;
          }
        }

        // Handle session state
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (session?.user) {
          console.log('Active session found:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          setUser(session.user);
          
          // If we're on the login page with an active session, redirect to home
          if (location.pathname === '/login') {
            navigate('/');
          }
        } else {
          console.log('No active session');
          setUser(null);
          
          // If we're not on login or callback page and have no session, redirect to login
          if (!['/login', '/auth/callback'].includes(location.pathname)) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        toast({
          title: 'Authentication Error',
          description: error instanceof Error ? error.message : 'Failed to authenticate',
          variant: 'destructive'
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, {
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        } : null
      });

      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        if (location.pathname === '/login' || location.pathname === '/auth/callback') {
          navigate('/');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign in...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error("Google sign in error:", error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No redirect URL received");
        toast({
          title: "Authentication Error",
          description: "Failed to start Google sign in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google sign in exception:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      console.log("Sign out successful");
      setUser(null);
      navigate("/login");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Sign out exception:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    supabase,
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) => 
      supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      }),
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
