
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthPage from './auth/AuthPage';
import OnboardingFlow from './onboarding/OnboardingFlow';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch user profile to check onboarding status
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setProfileLoading(false);
        }
      };

      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse overflow-hidden shadow-sm">
            <img 
              src="https://i.ibb.co/99z382Lg/Untitled-design-1.png" 
              alt="Frinance Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (profile && !profile.onboarded) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
