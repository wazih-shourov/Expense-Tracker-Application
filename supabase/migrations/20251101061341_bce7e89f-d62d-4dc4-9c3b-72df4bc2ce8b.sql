-- Create shopping_lists table
CREATE TABLE public.shopping_lists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE public.shopping_list_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_per_unit NUMERIC NOT NULL,
    unit_type TEXT NOT NULL DEFAULT 'pcs',
    quantity NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view their own shopping lists"
ON public.shopping_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists"
ON public.shopping_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists"
ON public.shopping_lists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists"
ON public.shopping_lists FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for shopping_list_items
CREATE POLICY "Users can view their own shopping list items"
ON public.shopping_list_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own shopping list items"
ON public.shopping_list_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own shopping list items"
ON public.shopping_list_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own shopping list items"
ON public.shopping_list_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.shopping_lists
        WHERE shopping_lists.id = shopping_list_items.shopping_list_id
        AND shopping_lists.user_id = auth.uid()
    )
);

-- Trigger for updated_at on shopping_lists
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for better query performance
CREATE INDEX idx_shopping_lists_user_date ON public.shopping_lists(user_id, date DESC);
CREATE INDEX idx_shopping_list_items_list_id ON public.shopping_list_items(shopping_list_id);