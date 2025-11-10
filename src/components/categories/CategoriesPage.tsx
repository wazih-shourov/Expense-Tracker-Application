import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Tags } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import CategorySpendingChart from './CategorySpendingChart';

const CategoriesPage = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📝'
  });

  const availableIcons = [
    '🍽️', '🚗', '🛒', '💡', '🎬', '🏥', '📚', '✈️', '⛽', '☕',
    '💰', '💼', '🏠', '👕', '🎮', '📱', '💊', '🎯', '🎨', '📝'
  ];

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          icon: categoryData.icon,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating category:', error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: { id: string } & typeof formData) => {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          icon: categoryData.icon
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category. It may be in use by transactions.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', icon: '📝' });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, ...formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b z-10">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" onClick={onBack} size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <ArrowLeft size={16} />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Categories</h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} size="sm" className="h-8 flex-shrink-0">
                  <Plus size={14} className="mr-1" />
                  <span className="hidden xs:inline">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Food & Dining"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Icon</Label>
                    <div className="grid grid-cols-8 gap-2 mt-2">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`p-2 text-base border rounded hover:bg-gray-100 transition-colors ${
                            formData.icon === icon ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="w-full"
                    >
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-4 pb-20">
          {/* Category Spending Chart */}
          <div className="w-full">
            <CategorySpendingChart />
          </div>

          {/* Categories List */}
          <Card className="w-full">
            <CardHeader className="pb-3 px-3 sm:px-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Tags size={16} className="flex-shrink-0" />
                <span className="truncate">Your Categories ({categories.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-xs sm:text-sm px-4">
                    No categories yet. Create your first category to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-lg sm:text-xl flex-shrink-0">{category.icon}</span>
                        <span className="font-medium text-gray-800 text-sm truncate">{category.name}</span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-8 w-8"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
