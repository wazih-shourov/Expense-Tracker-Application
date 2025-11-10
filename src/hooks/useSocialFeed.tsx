import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchPosts();

    // Set up realtime subscription
    const unique = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(`social-posts-changes-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // First try with profile embedding
      const { data, error } = await (supabase as any)
        .from('social_posts')
        .select(`
          *,
          profiles:profiles!social_posts_user_id_fkey(id, name, avatar)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Post fetch with embed failed, retrying without embed', error);
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('social_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        setPosts(fallbackData || []);
        return;
      }

      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (content: string) => {
    if (!user) return;

    try {
      const { data: newPost, error } = await (supabase as any)
        .from('social_posts')
        .insert({
          user_id: user.id,
          post_type: 'text',
          content,
        })
        .select()
        .single();

      if (error) throw error;
      // Optimistically prepend the new post
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
      }
      toast.success('Post created!');
      // Re-fetch to ensure consistency and embedded profiles if available
      await fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const createPoll = async (question: string, options: string[]) => {
    if (!user) return;

    try {
      const { data: postData, error: postError } = await (supabase as any)
        .from('social_posts')
        .insert({
          user_id: user.id,
          post_type: 'poll',
          content: question,
        })
        .select()
        .single();

      if (postError) throw postError;

      const pollOptions = options.map((option, index) => ({
        post_id: postData.id,
        option_text: option,
        option_order: index,
      }));

      const { error: optionsError } = await (supabase as any)
        .from('social_poll_options')
        .insert(pollOptions);

      if (optionsError) throw optionsError;

      // Optimistically prepend the new poll post
      if (postData) {
        setPosts((prev) => [postData, ...prev]);
      }

      toast.success('Poll created!');
      await fetchPosts(); // Immediately refresh the feed
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    }
  };

  const shareFinancialHealth = async () => {
    if (!user) return;

    try {
      // Fetch latest financial health score
      const { data: healthData, error: healthError } = await supabase
        .from('financial_health_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (healthError) throw healthError;

      const score = healthData?.score || 0;

      const { data: newPost, error } = await (supabase as any)
        .from('social_posts')
        .insert({
          user_id: user.id,
          post_type: 'financial_health',
          financial_score: score,
          content: `My current financial health: ${score}/100 💪`,
        })
        .select()
        .single();

      if (error) throw error;
      // Optimistically prepend the new health post
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
      }

      toast.success('Financial health shared!');
      await fetchPosts(); // Immediately refresh the feed
    } catch (error: any) {
      console.error('Error sharing financial health:', error);
      toast.error('Failed to share financial health');
    }
  };

  return {
    posts,
    isLoading,
    createPost,
    createPoll,
    shareFinancialHealth,
  };
};
