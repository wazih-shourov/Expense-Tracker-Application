import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, User, Moon, Sun, LogOut, DollarSign } from 'lucide-react';
import AvatarSelection from './AvatarSelection';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' }
];

const SettingsPage = ({ onBack }: { onBack: () => void }) => {
  const { user, signOut } = useAuth();
  const { isDarkMode, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD'
  });

  // Fetch user profile
  const { data: profile } = useQuery({
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
  });

  // Set form data when profile is loaded
  useEffect(() => {
    if (profile && user) {
      setFormData({
        name: profile.name || '',
        email: user.email || '',
        currency: profile.currency || 'USD'
      });
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string; currency: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          currency: profileData.currency
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both profile and currency-related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating profile:', error);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({ 
      name: formData.name,
      currency: formData.currency
    });
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setTheme(enabled);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedCurrencyInfo = currencies.find(c => c.code === formData.currency);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Avatar Selection */}
        <AvatarSelection currentAvatar={profile?.avatar} />

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Current: {selectedCurrencyInfo?.symbol} {selectedCurrencyInfo?.name}
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Currency Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="font-medium text-blue-800 mb-2">Current Currency</h3>
                <p className="text-blue-600 text-lg font-semibold">
                  {selectedCurrencyInfo?.symbol} {selectedCurrencyInfo?.name} ({selectedCurrencyInfo?.code})
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  All amounts throughout the app will be displayed in this currency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-gray-600" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    Toggle between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-800 mb-2">Sign Out</h3>
                <p className="text-sm text-red-600 mb-4">
                  You will be signed out and redirected to the login page.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Built with React, TypeScript, and Supabase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
