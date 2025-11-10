
-- Create financial_health_scores table to store calculated scores
CREATE TABLE public.financial_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  income_vs_expense_score INTEGER NOT NULL,
  spending_habits_score INTEGER NOT NULL,
  savings_score INTEGER NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own health scores" ON public.financial_health_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health scores" ON public.financial_health_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health scores" ON public.financial_health_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health scores" ON public.financial_health_scores
  FOR DELETE USING (auth.uid() = user_id);
