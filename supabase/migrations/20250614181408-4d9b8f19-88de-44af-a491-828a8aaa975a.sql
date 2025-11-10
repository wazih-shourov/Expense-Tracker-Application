
-- Create a table for savings buckets
CREATE TABLE public.savings_buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own savings buckets
ALTER TABLE public.savings_buckets ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own savings buckets
CREATE POLICY "Users can view their own savings buckets" 
  ON public.savings_buckets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own savings buckets
CREATE POLICY "Users can create their own savings buckets" 
  ON public.savings_buckets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own savings buckets
CREATE POLICY "Users can update their own savings buckets" 
  ON public.savings_buckets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own savings buckets
CREATE POLICY "Users can delete their own savings buckets" 
  ON public.savings_buckets 
  FOR DELETE 
  USING (auth.uid() = user_id);
