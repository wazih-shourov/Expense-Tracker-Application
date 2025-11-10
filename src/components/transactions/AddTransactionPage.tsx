import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionForm from './TransactionForm';
const AddTransactionPage = ({
  onBack
}: {
  onBack: () => void;
}) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    type: 'expense' as 'income' | 'expense',
    note: ''
  });

  // Fetch user's categories
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('🚀 Adding transaction with data:', {
        title: transactionData.title,
        amount: parseFloat(transactionData.amount),
        type: transactionData.type,
        category: transactionData.category,
        date: transactionData.date
      });
      const {
        data,
        error
      } = await supabase.from('transactions').insert({
        title: transactionData.title,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date,
        category: transactionData.category,
        type: transactionData.type,
        note: transactionData.note || null,
        user_id: user.id
      }).select().single();
      if (error) throw error;
      console.log('✅ Transaction added successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      });
      queryClient.invalidateQueries({
        queryKey: ['goals']
      });
      toast({
        title: "Success",
        description: "Transaction added successfully!"
      });

      // Reset form
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'expense',
        note: ''
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
      console.error('Error adding transaction:', error);
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    addTransactionMutation.mutate(formData);
  };
  return <div className="p-6 max-w-2xl mx-auto">
      

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            New Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm formData={formData} categories={categories} isLoading={addTransactionMutation.isPending} onFormDataChange={setFormData} onSubmit={handleSubmit} onCancel={onBack} />
        </CardContent>
      </Card>
    </div>;
};
export default AddTransactionPage;