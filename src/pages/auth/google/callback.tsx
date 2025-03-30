import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GmailService } from '@/services/gmail.service';
import { useToast } from '@/hooks/use-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      console.log('Callback received:', { code, error, user });
      
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

      if (!code || !user?.id) {
        console.error('Missing code or user:', { code, userId: user?.id });
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
        const gmailService = GmailService.getInstance();
        await gmailService.handleCallback(code, user.id);
        
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
  }, [navigate, user, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Connecting Gmail...</h2>
        <p className="text-muted-foreground">Please wait while we set up your Gmail integration.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
