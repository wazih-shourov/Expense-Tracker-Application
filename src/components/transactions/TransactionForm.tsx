
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFormProps {
  formData: {
    title: string;
    amount: string;
    date: string;
    category: string;
    type: 'income' | 'expense';
    note: string;
  };
  categories: Array<{ id: string; name: string; icon?: string }>;
  isLoading: boolean;
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

const TransactionForm = ({
  formData,
  categories,
  isLoading,
  onFormDataChange,
  onSubmit,
  onCancel,
  submitButtonText = 'Add Transaction'
}: TransactionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Grocery shopping"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Type *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: 'income' | 'expense') => {
              console.log('📝 Type selected:', value);
              onFormDataChange(prev => ({ ...prev, type: value }));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => 
            onFormDataChange(prev => ({ ...prev, category: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
