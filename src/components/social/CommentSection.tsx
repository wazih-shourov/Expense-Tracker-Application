import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [commentText, setCommentText] = useState('');
  const { comments, addComment, isLoading } = useComments(postId);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    await addComment(commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button onClick={handleSubmit} disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Comment'}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profiles?.avatar} />
              <AvatarFallback>
                {comment.profiles?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3">
                <p className="font-semibold text-sm">
                  {comment.profiles?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-foreground mt-1">{comment.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-3">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
