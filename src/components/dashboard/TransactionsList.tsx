
import { format } from 'date-fns';
import { getTransactionTypeInfo } from '@/utils/transactionUtils';
import { useCurrency } from '@/hooks/useCurrency';

interface TransactionsListProps {
  transactions: any[];
}

const TransactionsList = ({ transactions }: TransactionsListProps) => {
  const { formatAmount } = useCurrency();
  
  console.log('📋 TransactionsList received:', transactions?.length || 0, 'transactions');
  console.log('📋 All transactions:', transactions);
  
  const recentTransactions = transactions.slice(0, 7);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛒',
      'Bills & Utilities': '💡',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Groceries': '🛒',
      'Gas': '⛽',
      'Coffee': '☕',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Business': '💼',
      'Other': '📝'
    };
    return icons[category] || '💳';
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-muted-foreground">💳</span>
          </div>
          <p className="text-muted-foreground font-medium">No transactions yet</p>
          <p className="text-sm text-muted-foreground/70 mt-2">Add your first transaction to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Transactions</h3>
      
      <div className="space-y-1">
        {recentTransactions.map((transaction) => {
          const { isIncome, isExpense, displayType } = getTransactionTypeInfo(transaction);
          
          return (
            <div key={transaction.id} className="flex items-center justify-between py-4 px-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 border-b border-border/30 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{transaction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')} • {transaction.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${isExpense ? 'text-red-500' : isIncome ? 'text-emerald-500' : 'text-gray-500'}`}>
                  {isExpense ? '-' : isIncome ? '+' : ''}{formatAmount(Number(transaction.amount))}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {displayType}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionsList;
