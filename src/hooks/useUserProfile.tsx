import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserProfile = (userId: string | null) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetchProfile();
    fetchUserPosts();
    checkFollowStatus();
    fetchFollowerCount();

    const unique = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const followsChannel = supabase
      .channel(`follows-${userId}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_follows',
          filter: `following_id=eq.${userId}`,
        },
        () => {
          checkFollowStatus();
          fetchFollowerCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(followsChannel);
    };
  }, [userId, user]);

  const fetchProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchUserPosts = async () => {
    if (!userId) return;

    const { data, error } = await (supabase as any)
      .from('social_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return;
    }

    setPosts(data || []);
  };

  const checkFollowStatus = async () => {
    if (!user || !userId || user.id === userId) return;

    const { data } = await (supabase as any)
      .from('social_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const fetchFollowerCount = async () => {
    if (!userId) return;

    const { count } = await (supabase as any)
      .from('social_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    setFollowerCount(count || 0);
  };

  const toggleFollow = async () => {
    if (!user || !userId) return;

    try {
      if (isFollowing) {
        await (supabase as any)
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        toast.success('Unfollowed');
      } else {
        await (supabase as any).from('social_follows').insert({
          follower_id: user.id,
          following_id: userId,
        });
        toast.success('Following');
      }
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  return {
    profile,
    posts,
    isFollowing,
    followerCount,
    toggleFollow,
  };
};
