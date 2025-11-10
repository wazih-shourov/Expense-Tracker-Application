
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  id: string;
  type: 'transaction' | 'category';
  title: string;
  subtitle: string;
  amount?: number;
  transactionType?: 'income' | 'expense';
  date?: string;
  category?: string;
  icon?: string;
}

export const useSearch = (query: string) => {
  const { user } = useAuth();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', user?.id, debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!user?.id || !debouncedQuery.trim() || debouncedQuery.length < 2) {
        return [];
      }

      const results: SearchResult[] = [];

      // Search transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${debouncedQuery}%,note.ilike.%${debouncedQuery}%,category.ilike.%${debouncedQuery}%`)
        .order('date', { ascending: false })
        .limit(10);

      if (!transactionsError && transactions) {
        results.push(
          ...transactions.map((transaction): SearchResult => ({
            id: transaction.id,
            type: 'transaction',
            title: transaction.title,
            subtitle: `${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}`,
            amount: transaction.amount,
            transactionType: transaction.type as 'income' | 'expense',
            date: transaction.date,
            category: transaction.category,
          }))
        );
      }

      // Search categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', `%${debouncedQuery}%`)
        .limit(5);

      if (!categoriesError && categories) {
        results.push(
          ...categories.map((category): SearchResult => ({
            id: category.id,
            type: 'category',
            title: category.name,
            subtitle: `Category`,
            icon: category.icon,
          }))
        );
      }

      return results;
    },
    enabled: !!user?.id && debouncedQuery.length >= 2,
  });

  return {
    searchResults,
    isLoading: isLoading && debouncedQuery.length >= 2,
    hasQuery: debouncedQuery.length >= 2,
  };
};
