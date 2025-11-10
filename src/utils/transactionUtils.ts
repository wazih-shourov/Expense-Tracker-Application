
export const getTransactionTypeInfo = (transaction: any) => {
  console.log('🔍 Analyzing transaction:', {
    title: transaction.title,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount
  });

  // First and primary check: explicit type field
  if (transaction.type) {
    const typeStr = String(transaction.type).toLowerCase().trim();
    console.log('🔍 Type field value (normalized):', typeStr);
    
    if (typeStr === 'income') {
      console.log('✅ INCOME by explicit type field:', transaction.title);
      return {
        isIncome: true,
        isExpense: false,
        displayType: 'Income'
      };
    }
    if (typeStr === 'expense') {
      console.log('✅ EXPENSE by explicit type field:', transaction.title);
      return {
        isIncome: false,
        isExpense: true,
        displayType: 'Expense'
      };
    }
  }

  // Fallback: Default to expense if no explicit type is set
  console.log('❌ No explicit type found, defaulting to expense:', transaction.title);
  return {
    isIncome: false,
    isExpense: true,
    displayType: 'Expense'
  };
};

export const isIncomeTransaction = (transaction: any): boolean => {
  return getTransactionTypeInfo(transaction).isIncome;
};

export const isExpenseTransaction = (transaction: any): boolean => {
  return getTransactionTypeInfo(transaction).isExpense;
};
