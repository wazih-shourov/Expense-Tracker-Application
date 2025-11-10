import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetchProfile();

    // Subscribe to realtime profile updates
    const unique = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(`profile-${userId}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
  };
};
