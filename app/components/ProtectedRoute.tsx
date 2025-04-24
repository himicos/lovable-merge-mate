
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    // Check if we're on the auth callback route
    if (location.pathname.includes('/auth/callback')) {
      // We'll handle this silently
      return;
    }

    if (!isSupabaseConfigured && !window.localStorage.getItem('supabase-warning-shown')) {
      toast({
        title: "Supabase Configuration Missing",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
        variant: "destructive",
      });
      window.localStorage.setItem('supabase-warning-shown', 'true');
    }
  }, [isSupabaseConfigured, location.pathname]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
