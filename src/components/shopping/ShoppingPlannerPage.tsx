import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Check, X, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { AddShoppingListDialog } from './AddShoppingListDialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
interface ShoppingListItem {
  id: string;
  name: string;
  price_per_unit: number;
  unit_type: string;
  quantity: number;
  total_price: number;
  completed: boolean;
}
interface ShoppingList {
  id: string;
  date: string;
  total_amount: number;
  items: ShoppingListItem[];
}
const ShoppingPlannerPage = () => {
  const {
    user
  } = useAuth();
  const {
    formatAmount
  } = useCurrency();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  useEffect(() => {
    if (user) {
      fetchShoppingLists();
    }
  }, [user, selectedDate]);
  const fetchShoppingLists = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const {
        data: lists,
        error: listsError
      } = await supabase.from('shopping_lists').select('*').eq('user_id', user?.id).eq('date', dateStr).order('created_at', {
        ascending: false
      });
      if (listsError) throw listsError;
      if (lists && lists.length > 0) {
        const listsWithItems = await Promise.all(lists.map(async list => {
          const {
            data: items,
            error: itemsError
          } = await supabase.from('shopping_list_items').select('*').eq('shopping_list_id', list.id).order('created_at', {
            ascending: true
          });
          if (itemsError) throw itemsError;
          return {
            ...list,
            items: items || []
          };
        }));
        setShoppingLists(listsWithItems);
      } else {
        setShoppingLists([]);
      }
    } catch (error: any) {
      console.error('Error fetching shopping lists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shopping lists',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleItemComplete = async (listId: string, itemId: string, completed: boolean) => {
    try {
      const {
        error
      } = await supabase.from('shopping_list_items').update({
        completed: !completed
      }).eq('id', itemId);
      if (error) throw error;

      // Fetch the updated list to check if all items are complete
      const list = shoppingLists.find(l => l.id === listId);
      if (!list) return;

      // Update the item in local state
      const updatedItems = list.items.map(item => item.id === itemId ? {
        ...item,
        completed: !completed
      } : item);

      // Check if all items are now complete
      const allComplete = updatedItems.every(item => item.completed);

      // If all items are complete and transactions haven't been created yet
      if (allComplete && !completed) {
        const {
          data: listData
        } = await supabase.from('shopping_lists').select('transactions_created').eq('id', listId).single();
        if (listData && !listData.transactions_created) {
          // Create transactions for each item
          const transactionsToInsert = list.items.map(item => ({
            user_id: user?.id,
            type: 'expense',
            category: 'Shopping',
            title: item.name,
            amount: item.total_price,
            date: list.date,
            note: `${item.quantity} ${item.unit_type} @ ${formatAmount(item.price_per_unit)} each`
          }));
          const {
            error: transactionError
          } = await supabase.from('transactions').insert(transactionsToInsert);
          if (transactionError) throw transactionError;

          // Mark transactions as created
          const {
            error: updateError
          } = await supabase.from('shopping_lists').update({
            transactions_created: true
          }).eq('id', listId);
          if (updateError) throw updateError;
          toast({
            title: 'Success',
            description: 'Shopping expenses added to dashboard ✅'
          });
        }
      }
      await fetchShoppingLists();
      if (!allComplete) {
        toast({
          title: 'Success',
          description: completed ? 'Item marked as incomplete' : 'Item marked as complete'
        });
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive'
      });
    }
  };
  const deleteList = async (listId: string) => {
    try {
      const {
        error
      } = await supabase.from('shopping_lists').delete().eq('id', listId);
      if (error) throw error;
      await fetchShoppingLists();
      toast({
        title: 'Success',
        description: 'Shopping list deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shopping list',
        variant: 'destructive'
      });
    }
  };
  const allItemsCompleted = (items: ShoppingListItem[]) => {
    return items.length > 0 && items.every(item => item.completed);
  };
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  return <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            
            
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add List
            </Button>
          </div>
        </div>

        {/* Shopping Lists */}
        {loading ? <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading shopping lists...
            </CardContent>
          </Card> : shoppingLists.length === 0 ? <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {isToday ? 'No shopping list for today. Create one to get started!' : 'No shopping list for this date.'}
              </p>
              {isToday && <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Shopping List
                </Button>}
            </CardContent>
          </Card> : <div className="space-y-4">
            {shoppingLists.map(list => {
          const allCompleted = allItemsCompleted(list.items);
          if (allCompleted && isToday) {
            return <Card key={list.id} className="border-green-500">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-lg font-semibold text-foreground">
                        All items purchased for today!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Spent: {formatAmount(list.total_amount)}
                      </p>
                    </CardContent>
                  </Card>;
          }
          return <Card key={list.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Shopping List - {format(new Date(list.date), 'MMMM dd, yyyy')}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                    setEditingList(list);
                    setShowAddDialog(true);
                  }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm('Are you sure you want to delete this shopping list?')) {
                      deleteList(list.id);
                    }
                  }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {list.items.map(item => <div key={item.id} className={cn('flex items-center justify-between p-3 rounded-lg border bg-card', item.completed && 'opacity-60')}>
                          <div className="flex items-center gap-3 flex-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleItemComplete(list.id, item.id, item.completed)}>
                              {item.completed ? <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
                            </Button>
                            <div className="flex-1">
                              <p className={cn('font-medium text-foreground', item.completed && 'line-through')}>
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit_type} × {formatAmount(item.price_per_unit)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {formatAmount(item.total_price)}
                            </p>
                          </div>
                        </div>)}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Amount:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatAmount(list.total_amount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}
      </div>

      <AddShoppingListDialog open={showAddDialog} onOpenChange={open => {
      setShowAddDialog(open);
      if (!open) {
        setEditingList(null);
      }
    }} onSuccess={() => {
      fetchShoppingLists();
      setEditingList(null);
    }} editingList={editingList} selectedDate={selectedDate} />
    </div>;
};
export default ShoppingPlannerPage;