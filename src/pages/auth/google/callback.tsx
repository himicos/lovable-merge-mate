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
      console.log('Auth callback triggered, current URL:', window.location.href);
      
      // Check for hash parameters (implicit flow)
      const hashParams = new URLSearchParams(
        window.location.hash.replace('#', '')
      );
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');
      const error = hashParams.get('error');
      
      if (error) {
        console.error('Auth error:', error);
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      if (!accessToken) {
        console.error('No access token found in callback URL');
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      try {
        // Set the session with the tokens from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_in: parseInt(expiresIn || '3600')
        });
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session?.user) {
          console.log('Session established for user:', session.user.email);
          toast({
            title: "Success",
            description: "Successfully signed in!"
          });
          navigate('/');
          return;
        }
        
        // If no session yet and we haven't exceeded max attempts, wait and try again
        if (attempts < maxAttempts) {
          console.log(`Waiting for session... (attempt ${attempts + 1}/${maxAttempts})`);
          setTimeout(() => setAttempts(prev => prev + 1), 1000);
          return;
        }
        
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
