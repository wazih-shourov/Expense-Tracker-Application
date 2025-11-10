import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { FileText, Download, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const InventoryReports = () => {
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

  // Fetch stock transactions data
  const { data: transactions = [] } = useQuery({
    queryKey: ['stock-transactions-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          products (
            name,
            category,
            purchase_price,
            selling_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate reports data
  const reportsData = React.useMemo(() => {
    // Low stock products (quantity < 5)
    const lowStockProducts = products.filter(p => p.quantity < 5);
    
    // Stock value by category
    const categoryValues = products.reduce((acc: any, product) => {
      const value = Number(product.purchase_price) * product.quantity;
      acc[product.category] = (acc[product.category] || 0) + value;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryValues).map(([category, value]) => ({
      name: category,
      value: Number(value),
    }));

    // Profitability analysis
    const profitabilityData = products.map(product => ({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      purchasePrice: Number(product.purchase_price),
      sellingPrice: Number(product.selling_price),
      totalValue: Number(product.purchase_price) * product.quantity,
      potentialProfit: (Number(product.selling_price) - Number(product.purchase_price)) * product.quantity,
      marginPercent: Number(product.purchase_price) > 0 
        ? ((Number(product.selling_price) - Number(product.purchase_price)) / Number(product.purchase_price)) * 100 
        : 0,
    }));

    // Monthly stock movement (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const stockIn = transactions
        .filter(t => t.transaction_type === 'in' && t.created_at.startsWith(monthKey))
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const stockOut = transactions
        .filter(t => t.transaction_type === 'out' && t.created_at.startsWith(monthKey))
        .reduce((sum, t) => sum + t.quantity, 0);

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        'Stock In': stockIn,
        'Stock Out': stockOut,
      };
    }).reverse();

    return {
      lowStockProducts,
      categoryData,
      profitabilityData,
      monthlyData,
      totalProducts: products.length,
      totalStockValue: products.reduce((sum, p) => sum + (Number(p.purchase_price) * p.quantity), 0),
      totalPotentialRevenue: products.reduce((sum, p) => sum + (Number(p.selling_price) * p.quantity), 0),
    };
  }, [products, transactions]);

  const downloadReport = (type: string) => {
    // In a real implementation, you would generate and download the report
    // For now, we'll just show a placeholder
    alert(`Downloading ${type} report...`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (productsLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{reportsData.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatAmount(reportsData.totalStockValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(reportsData.totalPotentialRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="low-stock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="movement">Stock Movement</TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alert ({reportsData.lowStockProducts.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadReport('Low Stock')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              {reportsData.lowStockProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.lowStockProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="font-bold text-destructive">{product.quantity}</TableCell>
                          <TableCell>{product.unit_type}</TableCell>
                          <TableCell>
                            <Badge variant={product.quantity === 0 ? 'destructive' : 'secondary'}>
                              {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">All products have adequate stock levels</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Stock Value by Category
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadReport('Category')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              {reportsData.categoryData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportsData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportsData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatAmount(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Profitability Analysis
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadReport('Profitability')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              {reportsData.profitabilityData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Potential Profit</TableHead>
                        <TableHead>Margin %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.profitabilityData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatAmount(item.totalValue)}</TableCell>
                          <TableCell className={item.potentialProfit >= 0 ? 'text-green-600' : 'text-destructive'}>
                            {formatAmount(item.potentialProfit)}
                          </TableCell>
                          <TableCell className={item.marginPercent >= 0 ? 'text-green-600' : 'text-destructive'}>
                            {item.marginPercent.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No profitability data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Stock Movement (Last 6 Months)
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadReport('Stock Movement')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="Stock In" fill="hsl(var(--primary))" />
                    <Bar dataKey="Stock Out" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryReports;