
-- Create budget_plans table to store monthly budget limits for categories
CREATE TABLE public.budget_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, month, year)
);

-- Create notifications table to store budget alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'budget_alert',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for budget_plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget plans" 
  ON public.budget_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget plans" 
  ON public.budget_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget plans" 
  ON public.budget_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget plans" 
  ON public.budget_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp for budget_plans
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_plans_updated_at 
    BEFORE UPDATE ON public.budget_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
