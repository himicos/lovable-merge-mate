
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "emailgenius-desktop-main/src/context/ThemeContext";
import { AuthProvider } from "emailgenius-desktop-main/src/context/AuthContext";
import ProtectedRoute from "emailgenius-desktop-main/src/components/ProtectedRoute";
import Index from "emailgenius-desktop-main/src/pages/Index";
import NotFound from "emailgenius-desktop-main/src/pages/NotFound";
import Profile from "emailgenius-desktop-main/src/pages/Profile";
import Settings from "emailgenius-desktop-main/src/pages/Settings";
import Login from "emailgenius-desktop-main/src/pages/Login";
import Landing from "emailgenius-desktop-main/src/pages/Landing";
import { useEffect } from "react";
import { useAuth } from "emailgenius-desktop-main/src/context/AuthContext";

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
        const { hash, searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');
        const access_token = searchParams.get('access_token');
        
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          navigate('/', { replace: true });
        } else if (access_token) {
          // Handle magic link or other token-based auth
          const { data, error } = await supabase.auth.getUser(access_token);
          if (!error && data?.user) {
            navigate('/', { replace: true });
          }
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
      <ThemeProvider>
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
