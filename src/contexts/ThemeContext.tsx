
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch user profile including theme preference
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

  // Update theme preference mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (isDark: boolean) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ theme_preference: isDark ? 'dark' : 'light' } as any)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Apply theme to document
  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on app load
  useEffect(() => {
    // Check for saved theme preference in profile
    if (profile && (profile as any).theme_preference) {
      const isDark = (profile as any).theme_preference === 'dark';
      setIsDarkMode(isDark);
      applyTheme(isDark);
    } else {
      // Fallback to localStorage and system preference
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
      
      setIsDarkMode(isDark);
      applyTheme(isDark);
      
      // Save initial preference to database if user is logged in
      if (user?.id) {
        updateThemeMutation.mutate(isDark);
      }
    }
  }, [profile, user?.id]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage as backup
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Save to database
    if (user?.id) {
      updateThemeMutation.mutate(newTheme);
    }
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
    applyTheme(isDark);
    
    // Save to localStorage as backup
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Save to database
    if (user?.id) {
      updateThemeMutation.mutate(isDark);
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
