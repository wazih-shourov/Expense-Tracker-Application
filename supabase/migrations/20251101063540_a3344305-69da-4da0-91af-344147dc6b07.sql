-- Add transactions_created flag to shopping_lists table
ALTER TABLE public.shopping_lists
ADD COLUMN transactions_created boolean NOT NULL DEFAULT false;