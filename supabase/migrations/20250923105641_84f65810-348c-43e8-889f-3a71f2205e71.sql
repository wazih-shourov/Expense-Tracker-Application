-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_type TEXT NOT NULL DEFAULT 'pcs',
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    supplier TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_sku_per_user UNIQUE (user_id, sku)
);

-- Create stock_transactions table
CREATE TABLE public.stock_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create low_stock_alerts table
CREATE TABLE public.low_stock_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    threshold INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for stock_transactions
CREATE POLICY "Users can view their own stock transactions" 
ON public.stock_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stock transactions" 
ON public.stock_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for low_stock_alerts
CREATE POLICY "Users can view their own low stock alerts" 
ON public.low_stock_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own low stock alerts" 
ON public.low_stock_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own low stock alerts" 
ON public.low_stock_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own low stock alerts" 
ON public.low_stock_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create stock transactions when product quantity changes
CREATE OR REPLACE FUNCTION public.handle_product_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create transaction if quantity changed
    IF OLD.quantity != NEW.quantity THEN
        INSERT INTO public.stock_transactions (
            product_id,
            user_id,
            transaction_type,
            quantity,
            reference
        ) VALUES (
            NEW.id,
            NEW.user_id,
            CASE 
                WHEN NEW.quantity > OLD.quantity THEN 'in'
                ELSE 'out'
            END,
            ABS(NEW.quantity - OLD.quantity),
            'Auto-generated from product update'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;