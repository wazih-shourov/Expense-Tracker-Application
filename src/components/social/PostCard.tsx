import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, UserPlus, UserCheck, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';
import { useProfile } from '@/hooks/useProfile';
import CommentSection from './CommentSection';
import PollVoting from './PollVoting';

interface PostCardProps {
  post: any;
  onUserClick: (userId: string) => void;
}

const PostCard = ({ post, onUserClick }: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const {
    isFollowing,
    hasReacted,
    reactionCount,
    commentCount,
    toggleFollow,
    toggleReaction,
  } = useSocialInteractions(post);

  // Fetch user profile for name/avatar with realtime updates
  const { profile } = useProfile(post.user_id);

  const isOwnPost = user?.id === post.user_id;

  // Use embedded profile if available, otherwise use fetched profile
  const displayProfile = post.profiles || profile;

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            className="cursor-pointer"
            onClick={() => onUserClick(post.user_id)}
          >
            <AvatarImage src={displayProfile?.avatar} />
            <AvatarFallback>
              {displayProfile?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => onUserClick(post.user_id)}
            >
              {displayProfile?.name || 'Anonymous'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {!isOwnPost && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={toggleFollow}
            className="gap-2"
          >
            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {/* Content */}
      <div>
        {post.post_type === 'text' && (
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        )}

        {post.post_type === 'financial_health' && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-blue-600" size={24} />
              <h4 className="font-semibold text-lg">Financial Health Score</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">
                {post.financial_score}
              </span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {post.financial_score >= 70
                ? '🌟 Looking strong!'
                : post.financial_score >= 40
                ? '📈 Making progress!'
                : '💪 Keep going!'}
            </p>
            {post.content && (
              <p className="mt-3 text-foreground">{post.content}</p>
            )}
          </div>
        )}

        {post.post_type === 'poll' && <PollVoting post={post} />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleReaction}
          className={`gap-2 transition-all ${
            hasReacted ? 'text-red-500 scale-105' : 'hover:scale-105'
          }`}
        >
          <Heart
            size={18}
            fill={hasReacted ? 'currentColor' : 'none'}
            className="transition-transform"
          />
          <span>{reactionCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2"
        >
          <MessageCircle size={18} />
          <span>{commentCount}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </Card>
  );
};

export default PostCard;
