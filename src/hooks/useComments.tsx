import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();

    const unique = `${postId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(`comments-${postId}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('social_comments')
        .select(`
          *,
          profiles:profiles!social_comments_user_id_fkey(id, name, avatar)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await (supabase as any).from('social_comments').insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      if (error) throw error;
      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    addComment,
    isLoading,
  };
};
