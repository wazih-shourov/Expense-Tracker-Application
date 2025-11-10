import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from './PostCard';
import CreatePollDialog from './CreatePollDialog';
import { toast } from 'sonner';

const SocialFeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const { posts, createPost, shareFinancialHealth, isLoading } = useSocialFeed();

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    await createPost(postContent);
    setPostContent('');
  };

  const handleShareHealth = async () => {
    await shareFinancialHealth();
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Create Post Card */}
        <Card className="p-4 space-y-3">
          <Textarea
            placeholder="Share something with the community..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleCreatePost} disabled={isLoading}>
              Post
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPollDialogOpen(true)}
              disabled={isLoading}
            >
              Create Poll
            </Button>
            <Button
              variant="outline"
              onClick={handleShareHealth}
              disabled={isLoading}
              className="gap-2"
            >
              <TrendingUp size={16} />
              Share Financial Health
            </Button>
          </div>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {isLoading && posts.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUserClick={handleUserClick}
              />
            ))
          )}
        </div>
      </div>

      <CreatePollDialog
        open={isPollDialogOpen}
        onOpenChange={setIsPollDialogOpen}
      />
    </div>
  );
};

export default SocialFeedPage;
