
-- Enable RLS on existing tables that don't have it
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
  ON public.categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
  ON public.categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals" 
  ON public.goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
  ON public.goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Insert default categories for new users
INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Food & Dining', '🍽️', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Food & Dining')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Transportation', '🚗', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Transportation')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Shopping', '🛒', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Shopping')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Bills & Utilities', '💡', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Bills & Utilities')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Entertainment', '🎬', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Entertainment')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Healthcare', '🏥', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Healthcare')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Salary', '💰', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Salary')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, icon, user_id) 
SELECT 'Other', '📝', id FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE name = 'Other')
ON CONFLICT DO NOTHING;
