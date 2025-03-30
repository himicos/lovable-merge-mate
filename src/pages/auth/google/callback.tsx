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
      
      if (!code || !user?.id) {
        toast({
          title: "Error",
          description: "Failed to connect Gmail. Please try again.",
          variant: "destructive"
        });
        navigate('/settings');
        return;
      }

      try {
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
          description: "Failed to connect Gmail. Please try again.",
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
        <h2 className="text-2xl font-semibold mb-4">Connecting Gmail...</h2>
        <p>Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
