-- Fix function search path security warnings
-- Set search_path to prevent SQL injection attacks

-- Update handle_new_user function to set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, onboarded, currency)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', FALSE, 'USD');
  RETURN NEW;
END;
$function$;

-- Update notify_transaction_changes function to set search_path and SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.notify_transaction_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update update_updated_at_column function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;