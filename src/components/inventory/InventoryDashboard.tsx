import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();

  // Fetch products data
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch stock transactions for chart
  const { data: transactions = [] } = useQuery({
    queryKey: ['stock-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('stock_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate dashboard stats
  const totalProducts = products.length;
  const stockValue = products.reduce((sum, product) => 
    sum + (Number(product.purchase_price) * product.quantity), 0
  );
  const lowStockCount = products.filter(product => product.quantity < 5).length;
  const recentProducts = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(dateStr => {
      const stockIn = transactions
        .filter(t => {
          if (t.transaction_type !== 'in') return false;
          const transactionDate = t.created_at.split('T')[0];
          return transactionDate === dateStr;
        })
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const stockOut = transactions
        .filter(t => {
          if (t.transaction_type !== 'out') return false;
          const transactionDate = t.created_at.split('T')[0];
          return transactionDate === dateStr;
        })
        .reduce((sum, t) => sum + t.quantity, 0);

      return {
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Stock In': stockIn,
        'Stock Out': stockOut,
      };
    });
  }, [transactions]);

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatAmount(stockValue)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Products</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{recentProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Stock Movement (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.some(d => d['Stock In'] > 0 || d['Stock Out'] > 0) ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="Stock In" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Stock Out" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No stock movement in the last 7 days</p>
                  <p className="text-sm text-muted-foreground mt-2">Add or update products to see chart data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recently Added Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{product.quantity} {product.unit_type}</p>
                      <p className="text-sm text-muted-foreground">{formatAmount(Number(product.selling_price))}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products added yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDashboard;