
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Create a client outside of the component
const queryClient = new QueryClient();

// Auth callback handler component
function AuthCallback() {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback triggered, current URL:", window.location.href);
        
        const { hash, searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const access_token = searchParams.get('access_token');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');
        
        if (error) {
          console.error("Auth error:", error, error_description);
          throw new Error(`${error}: ${error_description}`);
        }
        
        if (code) {
          console.log("Exchanging code for session");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Session exchange error:", error);
            throw error;
          }
          
          console.log("Session exchange successful, redirecting to home");
          navigate('/', { replace: true });
        } else if (access_token) {
          // Handle magic link or other token-based auth
          console.log("Processing access token");
          const { data, error } = await supabase.auth.getUser(access_token);
          
          if (error) {
            console.error("Get user error:", error);
            throw error;
          }
          
          if (data?.user) {
            console.log("User retrieved successfully, redirecting to home");
            navigate('/', { replace: true });
          }
        } else {
          console.error("No code or access token found in callback URL");
          throw new Error("Invalid authentication callback");
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login', { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [supabase, navigate]);
  
  return <div className="flex h-screen items-center justify-center">Processing authentication...</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<Landing />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
