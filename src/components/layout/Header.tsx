
import { Search, Calendar, Settings, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useSearch } from '@/hooks/useSearch';
import SearchResults from '@/components/search/SearchResults';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { useToast } from '@/hooks/use-toast';

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

interface HeaderProps {
  onSettingsClick?: () => void;
  onEditProfileClick?: () => void;
}

const Header = ({ onSettingsClick, onEditProfileClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { searchResults, isLoading, hasQuery } = useSearch(searchValue);

  // Fetch user profile for avatar with forced refresh capability
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    staleTime: 0, // Always consider data stale to force refresh
  });

  // Force profile refetch periodically to catch avatar updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        refetchProfile();
      }
    }, 5000); // Refetch every 5 seconds

    return () => clearInterval(interval);
  }, [user?.id, refetchProfile]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Searching for:', searchValue);
      // Search results are already being displayed in the dropdown
      toast({
        title: "Search Results",
        description: `Found ${searchResults.length} results for "${searchValue}"`,
      });
    }
  };

  const handleSearchResultClick = (result: any) => {
    console.log('Selected search result:', result);
    setIsSearchFocused(false);
    setSearchValue('');
    
    toast({
      title: "Search Result Selected",
      description: `Selected ${result.type}: ${result.title}`,
    });

    // Here you could navigate to the specific transaction or category
    // For now, we'll just show a toast notification
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleEditProfileClick = () => {
    if (onEditProfileClick) {
      onEditProfileClick();
    }
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
    <header className="bg-transparent px-3 md:px-6 py-2 md:py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search transactions, categories..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 py-1.5 md:py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </form>
          
          {/* Search Results Dropdown */}
          {isSearchFocused && (
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              hasQuery={hasQuery}
              onResultClick={handleSearchResultClick}
            />
          )}
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-1 md:space-x-4 ml-3">
          {/* Desktop Actions - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Calendar Popup */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Calendar size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg" align="end">
                <div className="p-3">
                  <div className="text-sm font-medium text-foreground mb-3 text-center">
                    {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Select Date'}
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        console.log('Selected date:', format(date, 'PPP'));
                        toast({
                          title: "Date Selected",
                          description: `Selected: ${format(date, 'EEEE, MMMM do, yyyy')}`,
                        });
                        setIsCalendarOpen(false);
                      }
                    }}
                    className="rounded-md border-0"
                  />
                  {selectedDate && (
                    <div className="mt-3 p-2 bg-accent rounded-md">
                      <p className="text-xs text-muted-foreground text-center">
                        Selected: {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Notifications Dropdown */}
            <NotificationsDropdown />

            {/* Settings Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSettingsClick}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings size={20} />
            </Button>
          </div>
          
          {/* Profile Dropdown - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 w-7 h-7 md:w-8 md:h-8 rounded-full hover:opacity-80 transition-opacity">
                <Avatar className="w-7 h-7 md:w-8 md:h-8">
                  {profile?.avatar ? (
                    <AvatarImage 
                      src={getAvatarUrl(profile.avatar)} 
                      alt="Profile avatar"
                      key={`${profile.avatar}-${Date.now()}`} // Force re-render with timestamp
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleEditProfileClick}
                className="cursor-pointer hover:bg-accent"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer hover:bg-accent text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-1">
            {/* Mobile Calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Calendar size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        toast({
                          title: "Date Selected",
                          description: `Selected: ${format(date, 'EEEE, MMMM do, yyyy')}`,
                        });
                      }
                    }}
                    className="rounded-md border-0"
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Mobile Notifications */}
            <NotificationsDropdown />

            {/* Mobile Settings */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSettingsClick}
              className="p-1.5 text-muted-foreground hover:text-foreground"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
