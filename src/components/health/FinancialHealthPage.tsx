import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, DollarSign, PiggyBank, Calculator, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
interface FinancialHealthPageProps {
  onBack: () => void;
}
const FinancialHealthPage = ({
  onBack
}: FinancialHealthPageProps) => {
  const {
    user
  } = useAuth();
  const {
    formatAmount
  } = useCurrency();
  const queryClient = useQueryClient();

  // Fetch transactions for calculations with real-time updates
  const {
    data: transactions = [],
    refetch: refetchTransactions,
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('🔄 Fetching transactions for health score calculation...');
      const {
        data,
        error
      } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (error) {
        console.error('❌ Error fetching transactions:', error);
        throw error;
      }
      console.log('✅ Fetched transactions for health calculation:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
    // Refetch every 10 seconds for real-time updates
    staleTime: 5000 // Consider data stale after 5 seconds
  });

  // Fetch savings buckets with real-time updates
  const {
    data: savingsBuckets = [],
    refetch: refetchSavings,
    isLoading: savingsLoading
  } = useQuery({
    queryKey: ['savings_buckets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('savings_buckets').select('*').eq('user_id', user.id);
      if (error) {
        console.error('❌ Error fetching savings buckets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
    // Refetch every 10 seconds for real-time updates
    staleTime: 5000
  });

  // Fetch latest health score with real-time updates
  const {
    data: latestScore,
    refetch: refetchHealthScore,
    isLoading: scoreLoading
  } = useQuery({
    queryKey: ['financial_health_score', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('🔄 Fetching latest health score...');
      const {
        data,
        error
      } = await supabase.from('financial_health_scores').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) {
        console.error('❌ Error fetching health score:', error);
        throw error;
      }
      console.log('✅ Latest health score:', data);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
    // Refetch every 5 seconds for real-time updates
    staleTime: 2000
  });

  // Calculate health score mutation
  const calculateScoreMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('🧮 Starting health score calculation...');
      const scores = calculateHealthScores();
      console.log('📊 Calculated scores:', scores);
      const {
        error
      } = await supabase.from('financial_health_scores').insert({
        user_id: user.id,
        score: scores.overall,
        income_vs_expense_score: scores.incomeVsExpense,
        spending_habits_score: scores.spendingHabits,
        savings_score: scores.savings
      });
      if (error) {
        console.error('❌ Error inserting health score:', error);
        throw error;
      }
      return scores;
    },
    onSuccess: () => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({
        queryKey: ['financial_health_score', user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['savings_buckets', user?.id]
      });
      toast.success('Financial health score updated successfully!');
    },
    onError: error => {
      console.error('Error calculating health score:', error);
      toast.error('Failed to calculate health score');
    }
  });
  const calculateHealthScores = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    console.log('📅 Calculating scores from:', threeMonthsAgo.toISOString(), 'to:', now.toISOString());
    console.log('📊 Available transactions:', transactions.length);
    console.log('💰 Available savings buckets:', savingsBuckets.length);

    // Filter transactions from last 3 months
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= threeMonthsAgo;
    });
    console.log('📊 Recent transactions (last 3 months):', recentTransactions.length);

    // Calculate totals with proper type conversion
    const totalIncome = recentTransactions.filter(t => String(t.type).toLowerCase() === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = recentTransactions.filter(t => String(t.type).toLowerCase() === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalSavings = savingsBuckets.reduce((sum, bucket) => sum + Number(bucket.current_amount), 0);
    console.log('💵 Total Income:', totalIncome);
    console.log('💸 Total Expenses:', totalExpenses);
    console.log('🏦 Total Savings:', totalSavings);

    // Score 1: Income vs Expense (40% weight)
    let incomeVsExpenseScore = 0;
    if (totalIncome > 0) {
      const savingsRate = Math.max(0, (totalIncome - totalExpenses) / totalIncome);
      incomeVsExpenseScore = Math.min(100, Math.round(savingsRate * 100 * 2)); // Double for better scaling
    } else if (totalExpenses === 0) {
      incomeVsExpenseScore = 100; // Perfect score if no expenses and no income
    }

    // Score 2: Spending Habits (30% weight) - consistency and reasonable spending
    let spendingHabitsScore = 50; // Base score
    if (recentTransactions.length > 0) {
      const monthlyExpenses = [];
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthExpenses = recentTransactions.filter(t => {
          const tDate = new Date(t.date);
          return String(t.type).toLowerCase() === 'expense' && tDate >= monthStart && tDate <= monthEnd;
        }).reduce((sum, t) => sum + Number(t.amount), 0);
        monthlyExpenses.push(monthExpenses);
      }

      // Check consistency (lower variance = better score)
      if (monthlyExpenses.length > 1) {
        const avg = monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
        if (avg > 0) {
          const variance = monthlyExpenses.reduce((sum, exp) => sum + Math.pow(exp - avg, 2), 0) / monthlyExpenses.length;
          const consistency = Math.max(0, 100 - variance / avg * 100);
          spendingHabitsScore = Math.min(100, Math.max(20, consistency)); // Min 20, max 100
        }
      }
    }

    // Score 3: Savings (30% weight)
    let savingsScore = 0;
    if (totalIncome > 0) {
      const savingsToIncomeRatio = totalSavings / (totalIncome * 3); // 3 months income
      savingsScore = Math.min(100, Math.round(savingsToIncomeRatio * 100 * 3)); // Scale up
    } else if (totalSavings > 0) {
      savingsScore = 75; // Good score if they have savings but no tracked income
    }

    // Overall score (weighted average)
    const overall = Math.round(incomeVsExpenseScore * 0.4 + spendingHabitsScore * 0.3 + savingsScore * 0.3);
    console.log('🎯 Final scores:', {
      overall,
      incomeVsExpenseScore,
      spendingHabitsScore,
      savingsScore
    });
    return {
      overall,
      incomeVsExpense: incomeVsExpenseScore,
      spendingHabits: spendingHabitsScore,
      savings: savingsScore
    };
  };

  // Auto-calculate score when data changes or when there's no recent score
  useEffect(() => {
    if (user?.id && !transactionsLoading && !savingsLoading && !scoreLoading) {
      const shouldCalculate = !latestScore || latestScore && new Date(latestScore.created_at) < new Date(Date.now() - 60 * 60 * 1000); // 1 hour old

      if (shouldCalculate && (transactions.length > 0 || savingsBuckets.length > 0)) {
        console.log('🔄 Auto-calculating health score due to data changes or outdated score...');
        calculateScoreMutation.mutate();
      }
    }
  }, [transactions, savingsBuckets, latestScore, user?.id, transactionsLoading, savingsLoading, scoreLoading]);
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    toast.info('Refreshing data...');
    try {
      await Promise.all([refetchTransactions(), refetchSavings(), refetchHealthScore()]);

      // Force recalculation
      calculateScoreMutation.mutate();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Use latest score from database or fallback to calculated values
  const currentScores = latestScore || {
    score: 0,
    income_vs_expense_score: 0,
    spending_habits_score: 0,
    savings_score: 0
  };
  const recentTransactionsCount = transactions.filter(t => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return new Date(t.date) >= threeMonthsAgo;
  }).length;
  const totalSavingsAmount = savingsBuckets.reduce((sum, bucket) => sum + Number(bucket.current_amount), 0);
  const isLoading = transactionsLoading || savingsLoading || scoreLoading || calculateScoreMutation.isPending;
  return <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Financial Health Score</h1>
            
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Transactions (3mo)</div>
            <div className="text-2xl font-bold">{recentTransactionsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Savings</div>
            <div className="text-2xl font-bold">{formatAmount(totalSavingsAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Last Updated</div>
            <div className="text-sm font-bold">
              {latestScore ? new Date(latestScore.created_at).toLocaleString() : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Overall Financial Health</span>
          </CardTitle>
          <CardDescription>Your comprehensive financial wellness score</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor(currentScores.score)}`}>
              {isLoading ? '...' : currentScores.score}
            </div>
            <div className="text-xl text-muted-foreground">out of 100</div>
            {!isLoading && getScoreBadge(currentScores.score)}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(currentScores.score)}`} style={{
            width: `${currentScores.score}%`
          }}></div>
          </div>
          
          <Button onClick={() => calculateScoreMutation.mutate()} disabled={isLoading} className="w-full md:w-auto">
            <Calculator className="h-4 w-4 mr-2" />
            {isLoading ? 'Calculating...' : 'Recalculate Score'}
          </Button>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Income vs Expenses</span>
            </CardTitle>
            <CardDescription>40% of total score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`text-3xl font-bold ${getScoreColor(currentScores.income_vs_expense_score)}`}>
                {isLoading ? '...' : currentScores.income_vs_expense_score}
              </div>
              <Progress value={currentScores.income_vs_expense_score} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Based on your savings rate and income-to-expense ratio
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spending Habits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Spending Habits</span>
            </CardTitle>
            <CardDescription>30% of total score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`text-3xl font-bold ${getScoreColor(currentScores.spending_habits_score)}`}>
                {isLoading ? '...' : currentScores.spending_habits_score}
              </div>
              <Progress value={currentScores.spending_habits_score} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Consistency and patterns in your spending behavior
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <PiggyBank className="h-4 w-4" />
              <span>Savings</span>
            </CardTitle>
            <CardDescription>30% of total score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`text-3xl font-bold ${getScoreColor(currentScores.savings_score)}`}>
                {isLoading ? '...' : currentScores.savings_score}
              </div>
              <Progress value={currentScores.savings_score} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Your current savings relative to income
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Tips to improve your financial health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentScores.income_vs_expense_score < 60 && <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                <p className="text-sm">
                  <strong>Improve Income vs Expenses:</strong> Try to increase your income or reduce expenses to create a positive savings rate.
                </p>
              </div>}
            {currentScores.spending_habits_score < 60 && <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm">
                  <strong>Stabilize Spending:</strong> Work on creating consistent spending patterns and budgets to improve financial predictability.
                </p>
              </div>}
            {currentScores.savings_score < 60 && <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm">
                  <strong>Boost Savings:</strong> Consider setting up automatic transfers to savings accounts and creating emergency funds.
                </p>
              </div>}
            {currentScores.score >= 80 && <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-sm">
                  <strong>Excellent Work!</strong> You're maintaining great financial health. Keep up the good habits!
                </p>
              </div>}
            {currentScores.score === 0 && <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
                <p className="text-sm">
                  <strong>Get Started:</strong> Add some transactions and savings goals to see your financial health score!
                </p>
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default FinancialHealthPage;