import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, UserCheck, Users } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileDialog = ({ userId, open, onOpenChange }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const { profile, posts, isFollowing, followerCount, toggleFollow } = useUserProfile(userId);

  if (!userId || !profile) return null;

  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name || 'Anonymous'}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Users size={16} />
                <span>{followerCount} followers</span>
              </div>
              {!isOwnProfile && (
                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={toggleFollow}
                  className="mt-3 gap-2"
                >
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <h3 className="font-semibold text-lg">Posts</h3>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No posts yet
            </p>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
                {post.post_type === 'text' && (
                  <p className="text-foreground">{post.content}</p>
                )}
                {post.post_type === 'financial_health' && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg">
                    <p className="font-semibold">Financial Health: {post.financial_score}/100</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
