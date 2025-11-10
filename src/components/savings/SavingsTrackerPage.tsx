import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrency } from '@/hooks/useCurrency';
const SavingsTrackerPage = ({
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
  const [newBucket, setNewBucket] = useState({
    name: '',
    targetAmount: '',
    currentAmount: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch savings buckets
  const {
    data: savingsBuckets = []
  } = useQuery({
    queryKey: ['savings-buckets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {
        data,
        error
      } = await supabase.from('savings_buckets').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  const createBucketMutation = useMutation({
    mutationFn: async (bucketData: typeof newBucket) => {
      if (!user?.id) throw new Error('User not authenticated');
      const {
        data,
        error
      } = await supabase.from('savings_buckets').insert({
        name: bucketData.name,
        target_amount: parseFloat(bucketData.targetAmount),
        current_amount: parseFloat(bucketData.currentAmount) || 0,
        user_id: user.id
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['savings-buckets']
      });
      toast({
        title: "Success",
        description: "Savings bucket created successfully!"
      });
      setNewBucket({
        name: '',
        targetAmount: '',
        currentAmount: ''
      });
      setIsDialogOpen(false);
    },
    onError: error => {
      toast({
        title: "Error",
        description: "Failed to create savings bucket. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating bucket:', error);
    }
  });
  const updateBucketMutation = useMutation({
    mutationFn: async ({
      id,
      currentAmount
    }: {
      id: string;
      currentAmount: number;
    }) => {
      const {
        data,
        error
      } = await supabase.from('savings_buckets').update({
        current_amount: currentAmount
      }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['savings-buckets']
      });
      toast({
        title: "Success",
        description: "Savings amount updated!"
      });
    }
  });
  const deleteBucketMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('savings_buckets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['savings-buckets']
      });
      toast({
        title: "Success",
        description: "Savings bucket deleted!"
      });
    }
  });
  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucket.name || !newBucket.targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createBucketMutation.mutate(newBucket);
  };
  const handleUpdateAmount = (id: string, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0;
    updateBucketMutation.mutate({
      id,
      currentAmount: amount
    });
  };
  const totalSaved = savingsBuckets.reduce((sum, bucket) => sum + (bucket.current_amount || 0), 0);
  const totalTarget = savingsBuckets.reduce((sum, bucket) => sum + (bucket.target_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? totalSaved / totalTarget * 100 : 0;
  return <div className="min-h-screen bg-background">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-muted">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Tracker</h1>
            
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="premium-card mb-8">
          <CardHeader>
            
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Total Saved</span>
                <span className="font-bold text-lg">
                  {formatAmount(totalSaved)} / {formatAmount(totalTarget)}
                </span>
              </div>
              <Progress value={overallProgress} className="h-4" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-green-600">
                  {overallProgress.toFixed(1)}% of total goals
                </span>
                <span className="text-muted-foreground font-medium">
                  {formatAmount(Math.max(0, totalTarget - totalSaved))} remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Savings Buckets</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Savings Bucket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Savings Bucket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBucket} className="space-y-4">
                <div>
                  <Label htmlFor="bucketName">Bucket Name *</Label>
                  <Input id="bucketName" value={newBucket.name} onChange={e => setNewBucket(prev => ({
                  ...prev,
                  name: e.target.value
                }))} placeholder="e.g., Emergency Fund, Vacation" required />
                </div>
                <div>
                  <Label htmlFor="targetAmount">Target Amount *</Label>
                  <Input id="targetAmount" type="number" step="0.01" value={newBucket.targetAmount} onChange={e => setNewBucket(prev => ({
                  ...prev,
                  targetAmount: e.target.value
                }))} placeholder="1000.00" required />
                </div>
                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input id="currentAmount" type="number" step="0.01" value={newBucket.currentAmount} onChange={e => setNewBucket(prev => ({
                  ...prev,
                  currentAmount: e.target.value
                }))} placeholder="0.00" />
                </div>
                <Button type="submit" disabled={createBucketMutation.isPending} className="w-full">
                  {createBucketMutation.isPending ? 'Creating...' : 'Create Bucket'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Savings Buckets Grid */}
        {savingsBuckets.length === 0 ? <Card className="premium-card">
            <CardContent className="text-center py-12">
              <PiggyBank size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Savings Buckets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first savings bucket to start tracking your financial goals.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Add Your First Bucket
              </Button>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsBuckets.map(bucket => {
          const progress = bucket.target_amount > 0 ? bucket.current_amount / bucket.target_amount * 100 : 0;
          return <Card key={bucket.id} className="premium-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{bucket.name}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => deleteBucketMutation.mutate(bucket.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {formatAmount(bucket.current_amount || 0)} / {formatAmount(bucket.target_amount || 0)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className={`font-semibold ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                        {progress.toFixed(1)}% complete
                      </span>
                      <span className="text-muted-foreground">
                        {formatAmount(Math.max(0, (bucket.target_amount || 0) - (bucket.current_amount || 0)))} to go
                      </span>
                    </div>
                    <div className="pt-2">
                      <Label htmlFor={`update-${bucket.id}`} className="text-sm">Update Amount</Label>
                      <div className="flex gap-2 mt-1">
                        <Input id={`update-${bucket.id}`} type="number" step="0.01" placeholder="Enter new amount" onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      handleUpdateAmount(bucket.id, target.value);
                      target.value = '';
                    }
                  }} />
                        <Button size="sm" onClick={e => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                    if (input?.value) {
                      handleUpdateAmount(bucket.id, input.value);
                      input.value = '';
                    }
                  }}>
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}

        {/* Tips */}
        <Card className="premium-card mt-8">
          <CardHeader>
            <CardTitle className="text-xl">💡 Savings Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-3 text-base">Setting Up Buckets</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Start with an emergency fund (3-6 months expenses)</li>
                  <li>• Create specific buckets for goals</li>
                  <li>• Set realistic target amounts</li>
                  <li>• Break large goals into smaller milestones</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3 text-base">Building the Habit</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Set up automatic transfers</li>
                  <li>• Update your progress regularly</li>
                  <li>• Celebrate milestones</li>
                  <li>• Review and adjust goals quarterly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default SavingsTrackerPage;