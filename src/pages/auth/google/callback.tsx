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
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      console.log('Callback received:', { code, error, user, attempts });
      
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

      if (!code) {
        console.error('Missing authorization code');
        toast({
          title: "Error",
          description: "Failed to connect Gmail. Please try again.",
          variant: "destructive"
        });
        navigate('/settings');
        return;
      }

      try {
        console.log('Attempting to handle callback with code:', code.substring(0, 10) + '...');
        
        // Call the backend to handle the Gmail OAuth callback
        const response = await fetch(`https://www.verby.eu/auth/gmail/callback?code=${code}&user_id=${user.id}`);
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to connect Gmail');
        }
        
        const data = await response.json();
        console.log('Gmail connection successful:', data);
        
        toast({
          title: "Success",
          description: "Successfully connected your Gmail account!"
        });
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
