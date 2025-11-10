-- Fix security vulnerability: Remove overly permissive notification insert policy
-- This policy allowed any authenticated user to insert notifications for any user
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- The remaining policy "Users can create their own notifications" with 
-- WITH CHECK (auth.uid() = user_id) is secure and should remain.
-- 
-- The notify_transaction_changes() trigger function will still work because:
-- 1. Triggers run with elevated privileges (SECURITY DEFINER by default)
-- 2. The function doesn't rely on RLS policies when called from a trigger context
-- 
-- This fix ensures only users can create notifications for themselves,
-- while system triggers can still create notifications as needed.