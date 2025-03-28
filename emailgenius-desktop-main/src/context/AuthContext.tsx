import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variables (redacted for security)
console.log("Supabase URL:", supabaseUrl ? " Found" : " Missing");
console.log("Supabase Anon Key:", supabaseAnonKey ? " Found" : " Missing");

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true // Enable debug logs
  }
});

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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (session?.user) {
          console.log("Active session found:", {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          setUser(session.user);
          
          // If we're on the login page with an active session, redirect to home
          if (location.pathname === "/login") {
            navigate("/");
          }
        } else {
          console.log("No active session");
          setUser(null);
          
          // If we're not on login or callback page and have no session, redirect to login
          if (!["/login", "/auth/callback"].includes(location.pathname)) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, {
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        } : null
      });

      if (session?.user) {
        setUser(session.user);
        // After successful sign in, refresh user metadata
        const { data: { user: refreshedUser }, error } = await supabase.auth.refreshSession();
        if (refreshedUser && !error) {
          console.log("Refreshed user data:", {
            email: refreshedUser.email,
            metadata: refreshedUser.user_metadata
          });
          setUser(refreshedUser);
          
          // Redirect to home after successful sign in
          if (location.pathname === "/login") {
            navigate("/");
          }
        }
      } else {
        setUser(null);
        // Redirect to login if not already there
        if (!["/login", "/auth/callback"].includes(location.pathname)) {
          navigate("/login");
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign in...");
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'email profile'
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
      
      console.log("Google sign in response:", {
        provider: data?.provider,
        url: data?.url
      });
      
      // If we got a URL, redirect to it
      if (data?.url) {
        console.log("Redirecting to Google OAuth URL...");
        window.location.href = data.url;
      } else {
        console.error("No redirect URL received from Supabase");
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
        description: "An unexpected error occurred during Google sign in",
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
