import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/api/auth';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== Auth Callback Start ===');
      console.log('Current URL:', window.location.href);
      
      // Parse URL hash
      const hashParams = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      
      // Log all hash parameters for debugging
      console.log('Hash parameters:');
      for (const [key, value] of hashParams.entries()) {
        console.log(`${key}:`, key.includes('token') ? `${value.substring(0, 10)}...` : value);
      }
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');
      const error = hashParams.get('error');
      
      if (error) {
        console.error('Auth error encountered:', error);
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      if (!accessToken) {
        console.error('Access token missing from callback URL');
        console.log('Available hash params:', Array.from(hashParams.keys()));
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      try {
        console.log('Attempting to set session with tokens...');
        console.log('Access token length:', accessToken.length);
        console.log('Refresh token present:', !!refreshToken);
        console.log('Expires in:', expiresIn);
        
        // Check current session state
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session state:', currentSession ? 'Active' : 'None');
        
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
        
        if (session?.user) {
          console.log('Session successfully established');
          console.log('User:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          });
          
          toast({
            title: "Success",
            description: "Successfully signed in!"
          });
          navigate('/');
          return;
        }
        
        console.log('No session created after setSession');
        
        // If no session yet and we haven't exceeded max attempts, wait and try again
        if (attempts < maxAttempts) {
          console.log(`Retrying... (attempt ${attempts + 1}/${maxAttempts})`);
          setTimeout(() => setAttempts(prev => prev + 1), 1000);
          return;
        }
        
        console.error('Max attempts reached without establishing session');
        throw new Error('Failed to establish session after max attempts');
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, user, toast, attempts]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Connecting Gmail...</h2>
        <p className="text-muted-foreground">
          {!user?.id && attempts < maxAttempts 
            ? "Waiting for session..."
            : "Please wait while we set up your Gmail integration."
          }
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
