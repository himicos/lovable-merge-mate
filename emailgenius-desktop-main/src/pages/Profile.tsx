import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [userMetadata, setUserMetadata] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    memberSince: "",
  });

  useEffect(() => {
    if (user) {
      console.log("Profile: Received user data:", {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });

      const email = user.email || "";
      const name = user.user_metadata?.name || 
                  user.user_metadata?.full_name || 
                  email?.split("@")[0] || 
                  "User";
      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture || 
                       "";
      const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      setUserMetadata({
        name,
        email,
        avatarUrl,
        memberSince
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Profile: Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 h-screen p-6 overflow-y-auto">
          <h1 className="text-xl font-semibold uppercase tracking-wide mb-8">Profile</h1>
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 h-screen p-6 overflow-y-auto">
          <h1 className="text-xl font-semibold uppercase tracking-wide mb-8">Profile</h1>
          <div className="text-center">
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex-1 h-screen p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold uppercase tracking-wide">Profile</h1>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </Button>
        </div>
        <div className="bg-app-card rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              {userMetadata.avatarUrl ? (
                <AvatarImage src={userMetadata.avatarUrl} alt={userMetadata.name} />
              ) : (
                <AvatarFallback className="bg-gray-700 text-white text-xl">
                  {userMetadata.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{userMetadata.name}</h2>
              <p className="text-gray-400">{userMetadata.email}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm uppercase text-gray-400 mb-2">Email</h3>
              <p className="text-white">{userMetadata.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm uppercase text-gray-400 mb-2">Member Since</h3>
              <p className="text-white">{userMetadata.memberSince}</p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-400">
                Session ID: {user.id}<br />
                Last Updated: {new Date(user.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
