
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep1Props {
  onComplete: (categories: string[]) => void;
  selectedCategories: string[];
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onComplete, selectedCategories }) => {
  const [selected, setSelected] = useState<string[]>(selectedCategories);
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultCategories = [
    { name: 'Food & Dining', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Bills & Utilities', icon: '💡' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Healthcare', icon: '🏥' },
  ];

  const toggleCategory = (categoryName: string) => {
    setSelected(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !selected.includes(customCategory.trim())) {
      setSelected(prev => [...prev, customCategory.trim()]);
      setCustomCategory('');
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      toast({
        title: "Select Categories",
        description: "Please select at least one category to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Save selected categories to database
      const categoriesToInsert = selected.map(name => {
        const defaultCat = defaultCategories.find(cat => cat.name === name);
        return {
          user_id: user?.id,
          name,
          icon: defaultCat?.icon || '📝'
        };
      });

      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) throw error;

      onComplete(selected);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({
        title: "Error",
        description: "Failed to save categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Set Up Your Categories</h1>
        <p className="text-gray-600">Choose the spending categories that matter to you</p>
        <div className="mt-4">
          <span className="text-sm text-gray-500">Step 1 of 3</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {defaultCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => toggleCategory(category.name)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selected.includes(category.name)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="font-medium text-sm">{category.name}</div>
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="font-medium text-gray-800 mb-3">Add Custom Category</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter category name"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
          />
          <Button onClick={addCustomCategory} variant="outline">
            Add
          </Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-gray-800 mb-3">Selected Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {selected.map((category) => (
              <span
                key={category}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={loading || selected.length === 0}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep1;
