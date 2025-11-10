
-- Create a function to generate notifications for transaction changes
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

-- Create triggers for INSERT and DELETE on transactions table
CREATE TRIGGER trigger_notify_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_changes();

CREATE TRIGGER trigger_notify_transaction_delete
  AFTER DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_changes();

-- Add RLS policies for notifications table (if not already existing)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create comprehensive RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow the system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);
