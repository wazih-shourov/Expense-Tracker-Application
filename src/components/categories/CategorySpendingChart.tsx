
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategorySpending {
  category: string;
  amount: number;
  fill: string;
}

const CategorySpendingChart = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const isMobile = useIsMobile();

  const { data: spendingData = [], isLoading } = useQuery({
    queryKey: ['category-spending-chart', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get last 30 days of expense transactions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate);

      if (error) throw error;
      
      // Group by category and sum amounts
      const categoryTotals = (data || []).reduce((acc: Record<string, number>, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Number(transaction.amount);
        return acc;
      }, {});

      // Convert to chart data format with soft, modern colors
      const colors = [
        'hsl(220, 70%, 50%)', // Blue
        'hsl(142, 69%, 58%)', // Green
        'hsl(271, 81%, 56%)', // Purple
        'hsl(200, 98%, 39%)', // Cyan
        'hsl(48, 96%, 53%)',  // Yellow
        'hsl(348, 83%, 47%)', // Red
        'hsl(328, 86%, 65%)', // Pink
        'hsl(84, 81%, 44%)',  // Lime
      ];

      return Object.entries(categoryTotals)
        .map(([category, amount], index) => ({
          category: isMobile && category.length > 6 ? category.substring(0, 6) + '...' : category,
          fullCategory: category,
          amount: amount as number,
          fill: colors[index % colors.length],
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, isMobile ? 4 : 6);
    },
    enabled: !!user?.id,
  });

  const chartConfig = {
    amount: {
      label: "Amount",
    },
  };

  const totalSpending = spendingData.reduce((sum, item) => sum + item.amount, 0);
  const topCategory = spendingData[0];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Category Spending
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Loading spending data...
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (spendingData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Category Spending
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
              <p className="text-xs sm:text-sm">No spending data available</p>
              <p className="text-xs mt-1">Start adding expenses to see insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Category Spending</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Last 30 days
            </CardDescription>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {formatAmount(totalSpending)}
            </div>
            {topCategory && (
              <div className="text-xs text-muted-foreground mt-1 max-w-[80px] sm:max-w-none truncate">
                Top: {topCategory.fullCategory || topCategory.category}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 sm:px-6">
        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendingData}
                margin={{
                  top: 10,
                  right: 5,
                  left: 5,
                  bottom: isMobile ? 30 : 40,
                }}
                barCategoryGap={isMobile ? "15%" : "20%"}
              >
                <XAxis 
                  dataKey="category" 
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 40 : 50}
                  interval={0}
                  fontSize={isMobile ? 9 : 11}
                  tick={{ 
                    fontSize: isMobile ? 9 : 11,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `$${(value/1000).toFixed(0)}k`;
                    }
                    return `$${value}`;
                  }}
                  fontSize={isMobile ? 9 : 11}
                  width={isMobile ? 30 : 40}
                  tick={{ 
                    fontSize: isMobile ? 9 : 11,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax']}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        formatAmount(Number(value)),
                        "Spent"
                      ]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return `${item?.fullCategory || label}`;
                      }}
                      className="bg-card border border-border shadow-lg rounded-lg text-xs sm:text-sm"
                    />
                  }
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[3, 3, 0, 0]}
                  fill="var(--color-amount)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySpendingChart;
