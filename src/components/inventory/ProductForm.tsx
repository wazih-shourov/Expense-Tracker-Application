import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: any;
  onBack: () => void;
  onSuccess: () => void;
}

const ProductForm = ({ product, onBack, onSuccess }: ProductFormProps) => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    sku: product?.sku || '',
    quantity: product?.quantity || 0,
    unit_type: product?.unit_type || 'pcs',
    purchase_price: product?.purchase_price || 0,
    selling_price: product?.selling_price || 0,
    supplier: product?.supplier || '',
    notes: product?.notes || '',
  });

  const isEditing = !!product;

  // Calculate profit margin
  const profitMargin = React.useMemo(() => {
    const purchase = Number(formData.purchase_price);
    const selling = Number(formData.selling_price);
    if (purchase === 0) return 0;
    return ((selling - purchase) / purchase) * 100;
  }, [formData.purchase_price, formData.selling_price]);

  // Save product mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...formData,
        user_id: user?.id,
        quantity: Number(formData.quantity),
        purchase_price: Number(formData.purchase_price),
        selling_price: Number(formData.selling_price),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id)
          .eq('user_id', user?.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: `Product ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} product`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name and category are required',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    'Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Books', 
    'Sports & Outdoors', 'Health & Beauty', 'Toys & Games', 'Automotive', 'Other'
  ];

  const unitTypes = [
    'pcs', 'kg', 'gm', 'liter', 'ml', 'meter', 'cm', 'box', 'pack', 'set'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update product information' : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU/Code</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU or code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Supplier name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Inventory & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type</Label>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) => handleInputChange('unit_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stock Status</Label>
                <div className="p-3 rounded-md bg-muted">
                  <span className={`font-medium ${
                    formData.quantity === 0 ? 'text-destructive' :
                    formData.quantity < 5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {formData.quantity === 0 ? 'Out of Stock' :
                     formData.quantity < 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => handleInputChange('selling_price', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profit Margin</Label>
                <div className="p-3 rounded-md bg-muted">
                  <span className={`font-medium ${
                    profitMargin > 0 ? 'text-green-600' : 
                    profitMargin < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this product..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saveMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;