import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';
import TransactionForm from './TransactionForm';
const HistoryPage = ({
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
  const {
    formatAmount
  } = useCurrency();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    type: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    date: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    note: ''
  });
  const itemsPerPage = 10;

  // Fetch transactions with filters
  const {
    data: transactionsData,
    isLoading
  } = useQuery({
    queryKey: ['transactions', user?.id, filters, currentPage],
    queryFn: async () => {
      if (!user?.id) return {
        transactions: [],
        total: 0
      };
      let query = supabase.from('transactions').select('*', {
        count: 'exact'
      }).eq('user_id', user.id).order('date', {
        ascending: false
      }).order('created_at', {
        ascending: false
      });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      const {
        data,
        error,
        count
      } = await query;
      if (error) throw error;
      return {
        transactions: data || [],
        total: count || 0
      };
    },
    enabled: !!user?.id
  });

  // Fetch categories for filter
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
  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const {
        error
      } = await supabase.from('transactions').delete().eq('id', transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      });
      toast({
        title: "Success",
        description: "Transaction deleted successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive"
      });
    }
  });
  const deleteAllTransactionsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const {
        error
      } = await supabase.from('transactions').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      });
      toast({
        title: "Success",
        description: "All transactions deleted successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete all transactions.",
        variant: "destructive"
      });
    }
  });
  const updateTransactionMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: any;
    }) => {
      const {
        error
      } = await supabase.from('transactions').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions']
      });
      setEditingTransaction(null);
      toast({
        title: "Success",
        description: "Transaction updated successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update transaction.",
        variant: "destructive"
      });
    }
  });
  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
      note: transaction.note || ''
    });
  };
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.amount || !editFormData.date || !editFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    updateTransactionMutation.mutate({
      id: editingTransaction.id,
      data: {
        title: editFormData.title,
        amount: parseFloat(editFormData.amount),
        date: editFormData.date,
        category: editFormData.category,
        type: editFormData.type,
        note: editFormData.note
      }
    });
  };
  const handleDelete = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };
  const handleDeleteAll = () => {
    deleteAllTransactionsMutation.mutate();
  };
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      type: 'all'
    });
    setCurrentPage(1);
  };
  const totalPages = Math.ceil((transactionsData?.total || 0) / itemsPerPage);
  return <div className="p-6">
      

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={filters.startDate} onChange={e => setFilters(prev => ({
              ...prev,
              startDate: e.target.value
            }))} />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={filters.endDate} onChange={e => setFilters(prev => ({
              ...prev,
              endDate: e.target.value
            }))} />
            </div>

            <div>
              <Label htmlFor="categoryFilter">Category</Label>
              <Select value={filters.category} onValueChange={value => setFilters(prev => ({
              ...prev,
              category: value
            }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="typeFilter">Type</Label>
              <Select value={filters.type} onValueChange={value => setFilters(prev => ({
              ...prev,
              type: value
            }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transactions ({transactionsData?.total || 0})</CardTitle>
            {transactionsData?.total > 0 && <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 size={16} className="mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Transactions</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all transactions? This action cannot be undone and will permanently remove all your transaction history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700" disabled={deleteAllTransactionsMutation.isPending}>
                      {deleteAllTransactionsMutation.isPending ? "Deleting..." : "Delete All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Loading transactions...</div> : transactionsData?.transactions.length === 0 ? <div className="text-center py-8 text-gray-500">
              No transactions found matching your filters.
            </div> : <div className="space-y-3">
              {transactionsData?.transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{transaction.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')} • {transaction.category}
                        </p>
                        {transaction.note && <p className="text-sm text-gray-400 mt-1">{transaction.note}</p>}
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatAmount(Number(transaction.amount))}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="p-1" onClick={() => handleEdit(transaction)}>
                            <Edit size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 text-red-600 hover:text-red-700" onClick={() => handleDelete(transaction.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>}

          {/* Pagination */}
          {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-6">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                Next
              </Button>
            </div>}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          
          {editingTransaction && <TransactionForm formData={editFormData} categories={categories} isLoading={updateTransactionMutation.isPending} onFormDataChange={setEditFormData} onSubmit={handleUpdateSubmit} onCancel={() => setEditingTransaction(null)} />}
        </DialogContent>
      </Dialog>
    </div>;
};
export default HistoryPage;