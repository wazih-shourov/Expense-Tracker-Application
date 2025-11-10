import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePollVoting = (postId: string) => {
  const { user } = useAuth();
  const [pollOptions, setPollOptions] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetchPollData();

    const unique = `${postId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(`poll-votes-${postId}-${unique}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_poll_votes',
        },
        () => {
          fetchPollData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user]);

  const fetchPollData = async () => {
    try {
      // Fetch poll options
      const { data: options, error: optionsError } = await (supabase as any)
        .from('social_poll_options')
        .select('*')
        .eq('post_id', postId)
        .order('option_order');

      if (optionsError) throw optionsError;

      // Fetch vote counts for each option
      const optionsWithVotes = await Promise.all(
        (options || []).map(async (option: any) => {
          const { count } = await (supabase as any)
            .from('social_poll_votes')
            .select('*', { count: 'exact', head: true })
            .eq('poll_option_id', option.id);

          return { ...option, votes: count || 0 };
        })
      );

      setPollOptions(optionsWithVotes);
      setTotalVotes(optionsWithVotes.reduce((sum, opt) => sum + opt.votes, 0));

      // Check if user has voted
      if (user) {
        const { data: userVoteData } = await (supabase as any)
          .from('social_poll_votes')
          .select('poll_option_id')
          .eq('user_id', user.id)
          .in(
            'poll_option_id',
            optionsWithVotes.map((opt: any) => opt.id)
          )
          .maybeSingle();

        setUserVote(userVoteData?.poll_option_id || null);
      }
    } catch (error: any) {
      console.error('Error fetching poll data:', error);
    }
  };

  const vote = async (optionId: string) => {
    if (!user || userVote) return;

    try {
      const { error } = await (supabase as any).from('social_poll_votes').insert({
        poll_option_id: optionId,
        user_id: user.id,
      });

      if (error) {
        if (error.message.includes('poll creator')) {
          toast.error('Poll creators cannot vote on their own polls');
        } else if (error.message.includes('already voted')) {
          toast.error('You have already voted on this poll');
        } else {
          toast.error('Failed to vote');
        }
        console.error('Error voting:', error);
        return;
      }
      
      toast.success('Vote recorded!');
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  return {
    pollOptions,
    userVote,
    totalVotes,
    vote,
  };
};
