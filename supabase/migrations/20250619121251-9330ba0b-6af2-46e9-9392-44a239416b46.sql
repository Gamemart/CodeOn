
-- Add profile_alignment column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_alignment text DEFAULT 'left';

-- Add a check constraint to ensure valid alignment values
ALTER TABLE public.profiles 
ADD CONSTRAINT profile_alignment_check 
CHECK (profile_alignment IN ('left', 'center', 'right'));
