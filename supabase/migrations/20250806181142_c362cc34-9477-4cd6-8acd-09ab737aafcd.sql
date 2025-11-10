-- Recreate all tables and schema for the finance app

-- Create profiles table first (referenced by other tables)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  name TEXT,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  currency TEXT DEFAULT 'USD',
  avatar TEXT,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'))
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create categories RLS policies
CREATE POLICY "Users can view their own categories" ON public.categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" ON public.categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
FOR DELETE USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create transactions RLS policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
FOR DELETE USING (auth.uid() = user_id);

-- Create budget_plans table
CREATE TABLE public.budget_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on budget_plans
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- Create budget_plans RLS policies
CREATE POLICY "Users can view their own budget plans" ON public.budget_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget plans" ON public.budget_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget plans" ON public.budget_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget plans" ON public.budget_plans
FOR DELETE USING (auth.uid() = user_id);

-- Create savings_buckets table
CREATE TABLE public.savings_buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on savings_buckets
ALTER TABLE public.savings_buckets ENABLE ROW LEVEL SECURITY;

-- Create savings_buckets RLS policies
CREATE POLICY "Users can view their own savings buckets" ON public.savings_buckets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings buckets" ON public.savings_buckets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings buckets" ON public.savings_buckets
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings buckets" ON public.savings_buckets
FOR DELETE USING (auth.uid() = user_id);

-- Create financial_health_scores table
CREATE TABLE public.financial_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  income_vs_expense_score INTEGER NOT NULL,
  spending_habits_score INTEGER NOT NULL,
  savings_score INTEGER NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on financial_health_scores
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;

-- Create financial_health_scores RLS policies
CREATE POLICY "Users can view own health scores" ON public.financial_health_scores
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health scores" ON public.financial_health_scores
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health scores" ON public.financial_health_scores
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health scores" ON public.financial_health_scores
FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'budget_alert',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notifications RLS policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Create utility functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, onboarded, currency)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', FALSE, 'USD');
  RETURN NEW;
END;
$$;

-- Create function to notify transaction changes
CREATE OR REPLACE FUNCTION public.notify_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (new transaction added)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Transaction Added',
      'New ' || NEW.type || ' transaction "' || NEW.title || '" for ' || NEW.amount || ' added',
      'transaction_added'
    );
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (transaction deleted)
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      OLD.user_id,
      'Transaction Deleted',
      'Transaction "' || OLD.title || '" for ' || OLD.amount || ' was deleted',
      'transaction_deleted'
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_budget_plans_updated_at
  BEFORE UPDATE ON public.budget_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_buckets_updated_at
  BEFORE UPDATE ON public.savings_buckets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER notify_transaction_changes_trigger
  AFTER INSERT OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_transaction_changes();