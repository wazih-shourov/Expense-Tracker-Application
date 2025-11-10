import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfilePageProps {
  userId: string;
  onBack?: () => void;
}

const ProfilePage = ({ userId, onBack }: ProfilePageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, posts, isFollowing, followerCount, toggleFollow } = useUserProfile(userId);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleUserClick = (clickedUserId: string) => {
    setLocalUserId(clickedUserId);
  };

  // If clicking on another user from this profile, navigate to their profile
  useEffect(() => {
    if (localUserId && localUserId !== userId) {
      navigate(`/profile/${localUserId}`);
    }
  }, [localUserId, userId, navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto p-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back
        </Button>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.name || 'Anonymous'}</h1>
                <p className="text-sm text-muted-foreground">
                  {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                onClick={toggleFollow}
                className="gap-2"
              >
                {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </Card>

        {/* User's Posts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Posts</h2>
          {posts.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No posts yet
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, profiles: profile }}
                onUserClick={handleUserClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
