
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Check } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'avatar-1', url: '/avatars/3aa9575b-dca3-4762-a044-464736635007.png', type: 'male' },
  { id: 'avatar-2', url: '/avatars/3803b74a-ab45-4ea5-92bb-8631cff54739.png', type: 'female' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=65c3f7&clothesColor=262e33', type: 'male' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=65c3f7&clothesColor=d1d4aa', type: 'female' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male2&backgroundColor=fd9841&clothesColor=929598', type: 'male' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female2&backgroundColor=fd9841&clothesColor=ff5c5c', type: 'female' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male3&backgroundColor=ffdfbf&clothesColor=65c3f7', type: 'male' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female3&backgroundColor=ffdfbf&clothesColor=929598', type: 'female' },
  { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male4&backgroundColor=c0aede&clothesColor=fd9841', type: 'male' },
  { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female4&backgroundColor=c0aede&clothesColor=262e33', type: 'female' },
  { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male5&backgroundColor=ffeaa7&clothesColor=6c5ce7', type: 'male' },
  { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female5&backgroundColor=ffeaa7&clothesColor=55a3ff', type: 'female' }
];

interface AvatarSelectionProps {
  currentAvatar?: string;
}

const AvatarSelection = ({ currentAvatar }: AvatarSelectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const selectedAvatarData = PRESET_AVATARS.find(avatar => avatar.id === avatarId);
      if (!selectedAvatarData) throw new Error('Invalid avatar selection');

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar: avatarId })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Force immediate cache invalidation to update avatar everywhere
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Also invalidate specific user profile cache
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      // Force refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Success",
        description: "Profile avatar updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating avatar:', error);
    },
  });

  const handleSaveAvatar = () => {
    if (!selectedAvatar) {
      toast({
        title: "Error",
        description: "Please select an avatar first.",
        variant: "destructive",
      });
      return;
    }

    updateAvatarMutation.mutate(selectedAvatar);
  };

  const getAvatarUrl = (avatarId: string) => {
    // If it's a full URL (like Google avatar), return it directly
    if (avatarId?.startsWith('http')) {
      return avatarId;
    }
    
    // Otherwise, look it up in preset avatars
    const avatar = PRESET_AVATARS.find(a => a.id === avatarId);
    // Add cache busting timestamp to force refresh
    const timestamp = Date.now();
    return avatar?.url ? `${avatar.url}?t=${timestamp}` : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          Choose Profile Avatar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="flex items-center gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <Avatar className="w-16 h-16">
              {currentAvatar ? (
                <AvatarImage src={getAvatarUrl(currentAvatar)} alt="Current avatar" />
              ) : null}
              <AvatarFallback className="text-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-blue-800">Current Avatar</h3>
              <p className="text-sm text-blue-600">
                {currentAvatar?.startsWith('http') 
                  ? 'Using Google profile picture' 
                  : currentAvatar 
                    ? 'Custom avatar selected' 
                    : 'Using default avatar'}
              </p>
            </div>
          </div>

          {/* Avatar Selection Grid */}
          <div>
            <h3 className="font-medium mb-4">Choose from cartoon avatars:</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {PRESET_AVATARS.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? 'ring-2 ring-primary ring-offset-2 scale-105'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  title={`${avatar.type} avatar`}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={avatar.url} alt={`${avatar.type} avatar ${avatar.id}`} />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveAvatar}
              disabled={updateAvatarMutation.isPending || !selectedAvatar}
              className="min-w-[120px]"
            >
              {updateAvatarMutation.isPending ? 'Saving...' : 'Save Avatar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSelection;
