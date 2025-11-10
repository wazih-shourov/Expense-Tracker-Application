import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ShoppingItem {
  id: string;
  name: string;
  pricePerUnit: number;
  unitType: string;
  quantity: number;
  totalPrice: number;
}

interface AddShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingList?: any;
  selectedDate: Date;
}

const UNIT_TYPES = [
  'kg',
  'g',
  'L',
  'ml',
  'pcs',
  'packet',
  'dozen',
  'bag',
  'box',
  'bottle',
  'can',
];

export const AddShoppingListDialog = ({
  open,
  onOpenChange,
  onSuccess,
  editingList,
  selectedDate,
}: AddShoppingListDialogProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      pricePerUnit: 0,
      unitType: 'pcs',
      quantity: 1,
      totalPrice: 0,
    },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingList) {
      const mappedItems = editingList.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        pricePerUnit: parseFloat(item.price_per_unit),
        unitType: item.unit_type,
        quantity: parseFloat(item.quantity),
        totalPrice: parseFloat(item.total_price),
      }));
      setItems(mappedItems);
    } else {
      setItems([
        {
          id: crypto.randomUUID(),
          name: '',
          pricePerUnit: 0,
          unitType: 'pcs',
          quantity: 1,
          totalPrice: 0,
        },
      ]);
    }
  }, [editingList, open]);

  const updateItem = (id: string, field: keyof ShoppingItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'pricePerUnit' || field === 'quantity') {
            updated.totalPrice = updated.pricePerUnit * updated.quantity;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addNewItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        pricePerUnit: 0,
        unitType: 'pcs',
        quantity: 1,
        totalPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSave = async () => {
    const validItems = items.filter((item) => item.name.trim() && item.pricePerUnit > 0);

    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one valid item',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const totalAmount = calculateTotalAmount();
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      if (editingList) {
        // Update existing list
        const { error: updateError } = await supabase
          .from('shopping_lists')
          .update({ total_amount: totalAmount })
          .eq('id', editingList.id);

        if (updateError) throw updateError;

        // Delete old items
        const { error: deleteError } = await supabase
          .from('shopping_list_items')
          .delete()
          .eq('shopping_list_id', editingList.id);

        if (deleteError) throw deleteError;

        // Insert updated items
        const itemsToInsert = validItems.map((item) => ({
          shopping_list_id: editingList.id,
          name: item.name,
          price_per_unit: item.pricePerUnit,
          unit_type: item.unitType,
          quantity: item.quantity,
          total_price: item.totalPrice,
          completed: false,
        }));

        const { error: itemsError } = await supabase
          .from('shopping_list_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: 'Success',
          description: 'Shopping list updated successfully',
        });
      } else {
        // Create new list
        const { data: listData, error: listError } = await supabase
          .from('shopping_lists')
          .insert({
            user_id: user?.id,
            date: dateStr,
            total_amount: totalAmount,
          })
          .select()
          .single();

        if (listError) throw listError;

        const itemsToInsert = validItems.map((item) => ({
          shopping_list_id: listData.id,
          name: item.name,
          price_per_unit: item.pricePerUnit,
          unit_type: item.unitType,
          quantity: item.quantity,
          total_price: item.totalPrice,
          completed: false,
        }));

        const { error: itemsError } = await supabase
          .from('shopping_list_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: 'Success',
          description: 'Shopping list created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shopping list',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingList ? 'Edit Shopping List' : 'Add New Shopping List'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Date</Label>
            <Input
              type="text"
              value={format(selectedDate, 'MMMM dd, yyyy')}
              disabled
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Items</Label>
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Item Name</Label>
                    <Input
                      placeholder="e.g., Rice"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Price Per Unit</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.pricePerUnit || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Unit Type</Label>
                    <Select
                      value={item.unitType}
                      onValueChange={(value) => updateItem(item.id, 'unitType', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_TYPES.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={item.quantity || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <div className="text-right">
                    <Label className="text-sm text-muted-foreground">Total Price</Label>
                    <p className="text-lg font-semibold text-primary">
                      ৳{item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addNewItem}
              className="w-full gap-2"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add Another Item
            </Button>
          </div>

          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg mt-4">
            <span className="font-semibold text-lg">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">
              ৳{calculateTotalAmount().toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingList ? 'Update List' : 'Save List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};