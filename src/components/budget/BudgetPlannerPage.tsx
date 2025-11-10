import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit2, Trash2, AlertTriangle, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
interface BudgetPlannerPageProps {
  onBack: () => void;
}
interface BudgetPlan {
  id: string;
  category: string;
  monthly_limit: number;
  month: number;
  year: number;
}
interface CategorySpending {
  category: string;
  total: number;
}
const BudgetPlannerPage = ({
  onBack
}: BudgetPlannerPageProps) => {
  const {
    user
  } = useAuth();
  const {
    formatAmount
  } = useCurrency();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const alertsProcessedRef = useRef(new Set<string>());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  // Fetch budget plans for the selected month/year
  const {
    data: budgetPlans = [],
    isLoading: plansLoading
  } = useQuery({
    queryKey: ['budget-plans', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('budget_plans').select('*').eq('user_id', user.id).eq('month', selectedMonth).eq('year', selectedYear).order('category');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch categories for dropdown
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch spending for the selected month/year
  const {
    data: categorySpending = [],
    isLoading: spendingLoading
  } = useQuery({
    queryKey: ['category-spending', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user?.id) return [];
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      const {
        data,
        error
      } = await supabase.from('transactions').select('category, amount').eq('user_id', user.id).eq('type', 'expense').gte('date', startDate).lte('date', endDate);
      if (error) throw error;

      // Group by category and sum amounts
      const grouped = (data || []).reduce((acc: Record<string, number>, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
        return acc;
      }, {});
      return Object.entries(grouped).map(([category, total]) => ({
        category,
        total: total as number
      }));
    },
    enabled: !!user?.id
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async ({
      title,
      message,
      type
    }: {
      title: string;
      message: string;
      type: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if this exact notification already exists in the last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const {
        data: existingNotifications,
        error: checkError
      } = await supabase.from('notifications').select('id').eq('user_id', user.id).eq('message', message).gte('created_at', last24Hours.toISOString());
      if (checkError) throw checkError;

      // Only create notification if it doesn't exist
      if (!existingNotifications || existingNotifications.length === 0) {
        const {
          error
        } = await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message,
          type
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      });
    }
  });

  // Create/Update budget plan mutation
  const saveBudgetPlanMutation = useMutation({
    mutationFn: async ({
      id,
      category,
      monthly_limit
    }: {
      id?: string;
      category: string;
      monthly_limit: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (id) {
        // Update existing plan
        const {
          error
        } = await supabase.from('budget_plans').update({
          category,
          monthly_limit
        }).eq('id', id);
        if (error) throw error;
      } else {
        // Create new plan
        const {
          error
        } = await supabase.from('budget_plans').insert({
          user_id: user.id,
          category,
          monthly_limit,
          month: selectedMonth,
          year: selectedYear
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['budget-plans']
      });
      setIsAddDialogOpen(false);
      setEditingPlan(null);
      setNewCategory('');
      setNewLimit('');
      toast({
        title: "Success",
        description: "Budget plan saved successfully"
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: `Failed to save budget plan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete budget plan mutation
  const deleteBudgetPlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('budget_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['budget-plans']
      });
      toast({
        title: "Success",
        description: "Budget plan deleted successfully"
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: `Failed to delete budget plan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Check for budget alerts with proper deduplication
  useEffect(() => {
    if (!budgetPlans.length || !categorySpending.length || !user?.id) return;

    // Clear processed alerts when month/year changes
    const periodKey = `${selectedMonth}-${selectedYear}`;
    if (!alertsProcessedRef.current.has(periodKey)) {
      alertsProcessedRef.current.clear();
      alertsProcessedRef.current.add(periodKey);
    }
    budgetPlans.forEach(plan => {
      const spending = categorySpending.find(s => s.category === plan.category);
      if (!spending) return;
      const spentPercentage = spending.total / plan.monthly_limit * 100;

      // Only create notifications for 80% and 100% thresholds
      if (spentPercentage >= 80) {
        const alertKey = `${plan.category}-${selectedMonth}-${selectedYear}-${spentPercentage >= 100 ? '100' : '80'}`;

        // Check if we've already processed this alert
        if (alertsProcessedRef.current.has(alertKey)) return;
        const title = spentPercentage >= 100 ? "Budget Exceeded!" : "Budget Alert!";
        const message = spentPercentage >= 100 ? `You've exceeded your budget for ${plan.category} by ${formatAmount(spending.total - plan.monthly_limit)}` : `You've used ${spentPercentage.toFixed(0)}% of your ${plan.category} budget`;
        createNotificationMutation.mutate({
          title,
          message,
          type: 'budget_alert'
        });

        // Mark this alert as processed
        alertsProcessedRef.current.add(alertKey);
      }
    });
  }, [budgetPlans, categorySpending, selectedMonth, selectedYear, user?.id, formatAmount]);

  // Reset processed alerts when month/year changes
  useEffect(() => {
    alertsProcessedRef.current.clear();
  }, [selectedMonth, selectedYear]);
  const handleSavePlan = () => {
    if (!newCategory || !newLimit) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    saveBudgetPlanMutation.mutate({
      id: editingPlan?.id,
      category: newCategory,
      monthly_limit: parseFloat(newLimit)
    });
  };
  const getBudgetProgress = (category: string, limit: number) => {
    const spending = categorySpending.find(s => s.category === category);
    if (!spending) return {
      spent: 0,
      percentage: 0,
      remaining: limit
    };
    const percentage = Math.min(spending.total / limit * 100, 100);
    const remaining = Math.max(limit - spending.total, 0);
    return {
      spent: spending.total,
      percentage,
      remaining
    };
  };
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (plansLoading || spendingLoading) {
    return <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading budget data...</p>
        </div>
      </div>;
  }
  return <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Planner</h1>
            <p className="text-muted-foreground">
          </p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={18} />
              <span>Add Budget</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Budget Plan' : 'Add Budget Plan'}</DialogTitle>
              <DialogDescription>
                Set a monthly spending limit for a category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit">Monthly Limit</Label>
                <Input id="limit" type="number" placeholder="Enter amount" value={newLimit} onChange={e => setNewLimit(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setEditingPlan(null);
              setNewCategory('');
              setNewLimit('');
            }}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan} disabled={saveBudgetPlanMutation.isPending}>
                {saveBudgetPlanMutation.isPending ? 'Saving...' : 'Save Budget'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Budget Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={value => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={value => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetPlans.map(plan => {
        const progress = getBudgetProgress(plan.category, plan.monthly_limit);
        const isOverBudget = progress.percentage >= 100;
        const isNearLimit = progress.percentage >= 80;
        return <Card key={plan.id} className={`${isOverBudget ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{plan.category}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => {
                setEditingPlan(plan);
                setNewCategory(plan.category);
                setNewLimit(plan.monthly_limit.toString());
                setIsAddDialogOpen(true);
              }} className="h-8 w-8 p-0">
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBudgetPlanMutation.mutate(plan.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{formatAmount(plan.monthly_limit)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Spent: {formatAmount(progress.spent)}</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                      {progress.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={`font-medium ${progress.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatAmount(progress.remaining)}
                  </span>
                </div>
                
                {isNearLimit && <div className={`flex items-center space-x-2 p-2 rounded-md ${isOverBudget ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <AlertTriangle size={16} />
                    <span className="text-xs font-medium">
                      {isOverBudget ? 'Budget exceeded!' : 'Near budget limit!'}
                    </span>
                  </div>}
              </CardContent>
            </Card>;
      })}
      </div>

      {budgetPlans.length === 0 && <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Budget Plans</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first budget plan to start tracking your spending limits.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Budget Plan
            </Button>
          </CardContent>
        </Card>}
    </div>;
};
export default BudgetPlannerPage;