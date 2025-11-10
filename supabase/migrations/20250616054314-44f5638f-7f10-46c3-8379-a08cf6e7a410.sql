
-- Add avatar column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar TEXT DEFAULT NULL;

-- Add a comment to describe the avatar column
COMMENT ON COLUMN public.profiles.avatar IS 'Stores the selected avatar identifier for the user profile';
