-- Drop the existing trigger
DROP TRIGGER IF EXISTS product_stock_change_trigger ON public.products;

-- Drop the old function
DROP FUNCTION IF EXISTS public.handle_product_stock_change();

-- Create improved function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.handle_product_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT - create initial stock transaction if quantity > 0
    IF TG_OP = 'INSERT' AND NEW.quantity > 0 THEN
        INSERT INTO public.stock_transactions (
            product_id,
            user_id,
            transaction_type,
            quantity,
            reference
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'in',
            NEW.quantity,
            'Initial stock from product creation'
        );
    END IF;
    
    -- Handle UPDATE - create transaction only if quantity changed
    IF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
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
            'Stock adjustment from product update'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create new trigger for both INSERT and UPDATE
CREATE TRIGGER product_stock_change_trigger
AFTER INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_product_stock_change();