import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const StockTransactions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch stock transactions with product details
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['stock-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          products (
            name,
            category,
            sku,
            unit_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction =>
    transaction.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.products?.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate stock in and stock out transactions
  const stockInTransactions = filteredTransactions.filter(t => t.transaction_type === 'in');
  const stockOutTransactions = filteredTransactions.filter(t => t.transaction_type === 'out');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TransactionTable = ({ transactions, type }: { transactions: any[], type: 'in' | 'out' }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="font-medium text-foreground">
                  {transaction.products?.name || 'Unknown Product'}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {transaction.products?.category || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {transaction.products?.sku || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {type === 'in' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    type === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {type === 'in' ? '+' : '-'}{transaction.quantity} {transaction.products?.unit_type || 'pcs'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {transaction.reference || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {formatDate(transaction.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Transaction History ({filteredTransactions.length})
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  All ({filteredTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="in" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stock In ({stockInTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="out" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Stock Out ({stockOutTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <TransactionTable transactions={filteredTransactions} type="in" />
              </TabsContent>

              <TabsContent value="in" className="space-y-4">
                {stockInTransactions.length > 0 ? (
                  <TransactionTable transactions={stockInTransactions} type="in" />
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Stock In Transactions</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No stock in transactions match your search.' : 'No stock received yet.'}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="out" className="space-y-4">
                {stockOutTransactions.length > 0 ? (
                  <TransactionTable transactions={stockOutTransactions} type="out" />
                ) : (
                  <div className="text-center py-12">
                    <TrendingDown className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Stock Out Transactions</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No stock out transactions match your search.' : 'No stock issued yet.'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No transactions match your search criteria.' : 'No stock transactions recorded yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTransactions;