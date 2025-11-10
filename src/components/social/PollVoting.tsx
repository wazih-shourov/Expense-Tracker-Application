import { Button } from '@/components/ui/button';
import { usePollVoting } from '@/hooks/usePollVoting';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Lock } from 'lucide-react';

interface PollVotingProps {
  post: any;
}

const PollVoting = ({ post }: PollVotingProps) => {
  const { user } = useAuth();
  const { pollOptions, userVote, totalVotes, vote } = usePollVoting(post.id);
  
  const isCreator = user?.id === post.user_id;

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    const votes = pollOptions.find((opt) => opt.id === optionId)?.votes || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="space-y-3">
      {post.content && (
        <p className="text-foreground font-medium">{post.content}</p>
      )}
      <div className="space-y-2">
        {pollOptions.map((option) => {
          const percentage = getPercentage(option.id);
          const isVoted = userVote === option.id;
          const isDisabled = !!userVote || isCreator;

          return (
            <Button
              key={option.id}
              variant={isVoted ? 'default' : 'outline'}
              className="w-full justify-start relative overflow-hidden h-auto py-3"
              onClick={() => !isDisabled && vote(option.id)}
              disabled={isDisabled}
            >
              <div
                className="absolute left-0 top-0 h-full bg-blue-100 dark:bg-blue-900/20 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  {isVoted && <CheckCircle2 size={16} />}
                  {isCreator && !userVote && <Lock size={16} className="text-muted-foreground" />}
                  {option.option_text}
                </span>
                {(userVote || isCreator) && (
                  <span className="text-sm font-semibold">{percentage}%</span>
                )}
              </div>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </p>
    </div>
  );
};

export default PollVoting;
