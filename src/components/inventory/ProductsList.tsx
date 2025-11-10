import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Package, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface ProductsListProps {
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
}

const ProductsList = ({ onAddProduct, onEditProduct }: ProductsListProps) => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProduct, setDeleteProduct] = useState<any>(null);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      setDeleteProduct(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (quantity < 5) return { status: 'Low Stock', variant: 'secondary' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

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
      <div className="flex justify-end">
        <Button onClick={onAddProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              All Products ({filteredProducts.length})
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.quantity);
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium text-foreground">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{product.category}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{product.sku || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {product.quantity} {product.unit_type}
                          </span>
                        </TableCell>
                        <TableCell>
                        <span className="font-medium">
                            {formatAmount(Number(product.purchase_price))}
                          </span>
                        </TableCell>
                        <TableCell>
                        <span className="font-medium text-primary">
                            {formatAmount(Number(product.selling_price))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{product.supplier || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteProduct(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No products match your search criteria.' : 'Get started by adding your first product.'}
              </p>
              {!searchTerm && (
                <Button onClick={onAddProduct} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsList;