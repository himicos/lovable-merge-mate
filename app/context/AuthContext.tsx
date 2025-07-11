
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

type AuthContextType = {
  user: User | null;
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
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get current user
          try {
            const user = await authService.getCurrentUser();
            console.log('Active session found:', {
              id: user.id,
              email: user.email,
              email_verified: user.email_verified
            });
            setUser(user);
            
            // If we're on the login page with an active session, redirect to home
            if (location.pathname === '/login') {
              navigate('/');
            }
          } catch (error) {
            console.error('Failed to get current user:', error);
            setUser(null);
            // If we're not on login page, redirect to login
            if (location.pathname !== '/login') {
              navigate('/login');
            }
          }
        } else {
          console.log('No active session');
          setUser(null);
          
          // If we're not on login page, redirect to login
          if (location.pathname !== '/login') {
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
  }, [navigate, location.pathname, toast]);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign in...");
      await authService.signInWithGoogle();
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
      await authService.signOut();
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

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await authService.signUp(email, password);
      setUser(result.user);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const value = {
    user,
    signIn,
    signUp,
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
