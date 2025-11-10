import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { useMemo } from 'react';
import { isIncomeTransaction, isExpenseTransaction } from '@/utils/transactionUtils';
import { useCurrency } from '@/hooks/useCurrency';

interface StatsCardsProps {
  transactions: any[];
}

const StatsCards = ({ transactions }: StatsCardsProps) => {
  const { formatAmount } = useCurrency();

  const stats = useMemo(() => {
    console.log('=== STATS CALCULATION START ===');
    console.log('📊 All transactions received:', transactions);
    
    // Early return with default values if no transactions
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      console.log('❌ No valid transactions available');
      return [
        {
          title: 'Total Income',
          amount: formatAmount(0),
          change: 'No data available',
          isPositive: true,
          color: 'bg-emerald-500/10 border-emerald-500/20',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          icon: TrendingUp,
        },
        {
          title: 'Total Expenses',
          amount: formatAmount(0),
          change: 'No data available',
          isPositive: false,
          color: 'bg-red-500/10 border-red-500/20',
          textColor: 'text-red-600 dark:text-red-400',
          icon: TrendingDown,
        },
        {
          title: 'Net Balance',
          amount: formatAmount(0),
          change: '0%',
          isPositive: true,
          color: 'bg-blue-500/10 border-blue-500/20',
          textColor: 'text-blue-600 dark:text-blue-400',
          icon: DollarSign,
        },
        {
          title: 'Total Savings',
          amount: formatAmount(0),
          change: 'No savings tracked',
          isPositive: true,
          color: 'bg-purple-500/10 border-purple-500/20',
          textColor: 'text-purple-600 dark:text-purple-400',
          icon: PiggyBank,
        },
      ];
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    console.log('📅 Current month:', currentMonth + 1, 'Current year:', currentYear);

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      
      const transactionDate = new Date(t.date);
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                            transactionDate.getFullYear() === currentYear;
      return isCurrentMonth;
    });

    console.log('📋 Current month transactions:', currentMonthTransactions);

    // Filter income and expense transactions using utility functions
    const incomeTransactions = currentMonthTransactions.filter(isIncomeTransaction);
    const expenseTransactions = currentMonthTransactions.filter(isExpenseTransaction);

    console.log('💰 Income transactions:', incomeTransactions);
    console.log('💸 Expense transactions:', expenseTransactions);

    // Calculate totals
    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0;
      console.log(`💰 Adding income: ${formatAmount(amount)} from "${t.title}"`);
      return sum + amount;
    }, 0);

    const totalExpenses = expenseTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0;
      console.log(`💸 Adding expense: ${formatAmount(amount)} from "${t.title}"`);
      return sum + amount;
    }, 0);

    console.log('💵 FINAL TOTALS:');
    console.log('Total Income:', totalIncome);
    console.log('Total Expenses:', totalExpenses);

    const netBalance = totalIncome - totalExpenses;
    const totalSavings = Math.max(0, netBalance); // Savings is positive net balance

    console.log('=== STATS CALCULATION END ===');

    return [
      {
        title: 'Total Income',
        amount: formatAmount(totalIncome),
        change: incomeTransactions.length > 0 ? `${incomeTransactions.length} transaction${incomeTransactions.length !== 1 ? 's' : ''} this month` : 'No income this month',
        isPositive: true,
        color: 'bg-emerald-500/10 border-emerald-500/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        icon: TrendingUp,
      },
      {
        title: 'Total Expenses',
        amount: formatAmount(totalExpenses),
        change: expenseTransactions.length > 0 ? `${expenseTransactions.length} transaction${expenseTransactions.length !== 1 ? 's' : ''} this month` : 'No expenses this month',
        isPositive: false,
        color: 'bg-red-500/10 border-red-500/20',
        textColor: 'text-red-600 dark:text-red-400',
        icon: TrendingDown,
      },
      {
        title: 'Net Balance',
        amount: formatAmount(netBalance),
        change: `${netBalance >= 0 ? 'Positive' : 'Negative'} balance`,
        isPositive: netBalance >= 0,
        color: 'bg-blue-500/10 border-blue-500/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        icon: DollarSign,
      },
      {
        title: 'Total Savings',
        amount: formatAmount(totalSavings),
        change: totalSavings > 0 ? 'Available for savings' : 'No savings this month',
        isPositive: totalSavings > 0,
        color: 'bg-purple-500/10 border-purple-500/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        icon: PiggyBank,
      },
    ];
  }, [transactions, formatAmount]);

  return (
    <>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`premium-card ${stat.color} p-3 md:p-6 transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 font-medium truncate">
                  {stat.title}
                </p>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-3 truncate">
                  {stat.amount}
                </h3>
                <p className={`text-xs ${stat.textColor} flex items-center space-x-1 font-medium`}>
                  <Icon size={12} className="flex-shrink-0" />
                  <span className="truncate text-xs">{stat.change}</span>
                </p>
              </div>
              <div className={`p-2 md:p-3 rounded-xl ${stat.color} flex-shrink-0 ml-2`}>
                <Icon className={stat.textColor} size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StatsCards;
