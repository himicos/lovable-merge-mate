import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
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
        const hashParams = new URLSearchParams(
          window.location.hash.replace('#', '')
        );
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in');
        const error = hashParams.get('error');
        
        if (error) {
          console.error('Auth error:', error);
          throw new Error(`Authentication error: ${error}`);
        }
        
        if (!accessToken) {
          console.error('No access token in callback URL');
          throw new Error('Invalid authentication callback');
        }
        
        // Set the session with the tokens from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_in: parseInt(expiresIn || '3600')
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (!session?.user) {
          throw new Error('No user in session after auth');
        }
        
        navigate('/', { replace: true });
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
