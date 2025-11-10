
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep2Props {
  onComplete: () => void;
  selectedCategories: string[];
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ onComplete, selectedCategories }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(selectedCategories[0] || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          title,
          amount: parseFloat(amount),
          type,
          category,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Transaction Added!",
        description: "Your first transaction has been recorded."
      });

      onComplete();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Your First Transaction</h1>
        <p className="text-gray-600">Let's get started with your expense tracking</p>
        <div className="mt-4">
          <span className="text-sm text-gray-500">Step 2 of 3</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Transaction Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Grocery shopping"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label>Type</Label>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {selectedCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip this step
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
