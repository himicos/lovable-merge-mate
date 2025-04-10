import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GmailService } from '@/services/gmail';
import { useToast } from '@/hooks/use-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Auth callback triggered, current URL:', window.location.href);
      
      // Check for hash parameters (implicit flow)
      const hashParams = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      
      // Check for query parameters (authorization code flow)
      const queryParams = new URLSearchParams(window.location.search);
      
      const code = queryParams.get('code');
      const error = queryParams.get('error') || hashParams.get('error');
      const accessToken = hashParams.get('access_token');
      
      console.log('Callback received:', { code, error, accessToken, user, attempts });
      
      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Error",
          description: `Failed to connect Gmail: ${error}`,
          variant: "destructive"
        });
        navigate('/settings');
        return;
      }

      // If no user yet and we haven't exceeded max attempts, wait and try again
      if (!user?.id) {
        if (attempts < maxAttempts) {
          console.log('User session not ready, waiting... (attempt ${attempts + 1}/${maxAttempts})');
          setTimeout(() => setAttempts(prev => prev + 1), 1000);
          return;
        } else {
          console.error('Max attempts reached waiting for user session');
          toast({
            title: "Error",
            description: "Failed to get user session. Please try again.",
            variant: "destructive"
          });
          navigate('/settings');
          return;
        }
      }

      // Handle implicit flow (access token in hash)
      if (accessToken) {
        console.log('Using implicit flow with access token');
        
        // The session should be automatically handled by Supabase
        // Just wait for the session to be established
        if (user?.id) {
          console.log('User session established');
          navigate('/');
          return;
        }
        
        // If no user yet, keep waiting via the attempts counter
        return;
      }
      
      // Handle authorization code flow
      if (!code) {
        console.error('No code or access token found in callback URL');
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      try {
        console.log('Using authorization code flow');
        
        // Let Supabase handle the code exchange
        // The session will be automatically established
        if (user?.id) {
          console.log('User session established');
          navigate('/');
          return;
        }
        
        // If no user yet, keep waiting via the attempts counter
      } catch (error) {
        console.error('Error handling Google callback:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to connect Gmail. Please try again.",
          variant: "destructive"
        });
      }

      navigate('/settings');
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
