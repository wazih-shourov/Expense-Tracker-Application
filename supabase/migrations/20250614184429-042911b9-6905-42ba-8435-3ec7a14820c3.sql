
-- Add currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN currency TEXT DEFAULT 'USD';

-- Update the handle_new_user function to include currency
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, onboarded, currency)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', FALSE, 'USD');
  RETURN NEW;
END;
$function$;
