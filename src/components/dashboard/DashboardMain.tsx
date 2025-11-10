
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import StatsCards from './StatsCards';
import TransactionsList from './TransactionsList';
import WeeklyExpenseChart from './WeeklyExpenseChart';
import Calendar from './Calendar';
import TopCategories from './TopCategories';

const DashboardMain = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Fetch user's transactions with enhanced logging for debugging
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('🔄 Fetching transactions for user:', user.id);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching transactions:', error);
        return [];
      }
      
      console.log('✅ Fetched transactions:', data?.length || 0);
      console.log('📊 Raw transaction data from DB:', data?.map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date
      })));
      
      console.log('📊 Transaction types breakdown:', data?.reduce((acc, t) => {
        const originalType = t.type;
        const normalizedType = String(t.type).toLowerCase().trim();
        acc[`${originalType} (${normalizedType})`] = (acc[`${originalType} (${normalizedType})`] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user's categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Filter transactions based on selected date
  const filteredTransactions = useMemo(() => {
    if (!selectedDate) return transactions;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return transactions.filter(t => t.date === dateStr);
  }, [transactions, selectedDate]);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-background min-h-screen">
      {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatsCards transactions={filteredTransactions} />
      </div>
      
      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Charts and Transactions */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <WeeklyExpenseChart transactions={filteredTransactions} />
          <TransactionsList transactions={filteredTransactions} />
        </div>
        
        {/* Right Column - Sidebar Content */}
        <div className="space-y-4 md:space-y-6">
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          <TopCategories transactions={filteredTransactions} categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
