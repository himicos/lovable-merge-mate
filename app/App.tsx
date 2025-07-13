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
import { authService } from "@/services/auth.service";


// Create a client outside of the component
const queryClient = new QueryClient();

// Auth callback handler component
function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle OAuth callback (simplified for JWT auth)
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.replace('#', '')
        );
        
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        
        if (error) {
          console.error('Auth error:', error);
          throw new Error(`Authentication error: ${error}`);
        }
        
        if (accessToken) {
          // Handle Google OAuth callback with the JWT auth service
          await authService.handleGoogleCallback(accessToken);
          navigate('/', { replace: true });
        } else {
          // If no access token, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login', { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
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
