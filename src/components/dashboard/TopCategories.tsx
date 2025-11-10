
import { useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';

interface TopCategoriesProps {
  transactions: any[];
  categories: any[];
}

const TopCategories = ({ transactions, categories }: TopCategoriesProps) => {
  const { formatAmount } = useCurrency();
  
  const categoryData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryTotals = monthlyExpenses.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Number(transaction.amount);
      return acc;
    }, {} as { [key: string]: number });

    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount: Number(amount),
        percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return sortedCategories;
  }, [transactions]);

  return (
    <div className="premium-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Top Categories</h3>
      
      {categoryData.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-muted-foreground">📊</span>
          </div>
          <p className="text-muted-foreground font-medium">No expenses this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryData.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{category.name}</span>
                <span className="text-sm font-bold text-muted-foreground">{formatAmount(category.amount)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{category.percentage.toFixed(1)}% of total</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCategories;
