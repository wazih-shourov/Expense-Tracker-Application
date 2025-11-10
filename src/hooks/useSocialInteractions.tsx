import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSocialInteractions = (post: any) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    checkFollowStatus();
    checkReactionStatus();
    fetchCounts();

    // Realtime subscriptions
    const unique = `${post.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const reactionsChannel = supabase
      .channel(`reactions-${post.id}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_reactions',
          filter: `post_id=eq.${post.id}`,
        },
        () => {
          checkReactionStatus();
          fetchCounts();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`comments-${post.id}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_comments',
          filter: `post_id=eq.${post.id}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, post.id]);

  const checkFollowStatus = async () => {
    if (!user || user.id === post.user_id) return;

    const { data } = await (supabase as any)
      .from('social_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', post.user_id)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const checkReactionStatus = async () => {
    if (!user) return;

    const { data } = await (supabase as any)
      .from('social_reactions')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setHasReacted(!!data);
  };

  const fetchCounts = async () => {
    const { count: reactions } = await (supabase as any)
      .from('social_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    const { count: comments } = await (supabase as any)
      .from('social_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    setReactionCount(reactions || 0);
    setCommentCount(comments || 0);
  };

  const toggleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await (supabase as any)
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', post.user_id);
        toast.success('Unfollowed');
      } else {
        await (supabase as any).from('social_follows').insert({
          follower_id: user.id,
          following_id: post.user_id,
        });
        toast.success('Following');
      }
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const toggleReaction = async () => {
    if (!user) return;

    try {
      if (hasReacted) {
        await (supabase as any)
          .from('social_reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await (supabase as any).from('social_reactions').insert({
          post_id: post.id,
          user_id: user.id,
          reaction_type: 'like',
        });
      }
      setHasReacted(!hasReacted);
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  return {
    isFollowing,
    hasReacted,
    reactionCount,
    commentCount,
    toggleFollow,
    toggleReaction,
  };
};
