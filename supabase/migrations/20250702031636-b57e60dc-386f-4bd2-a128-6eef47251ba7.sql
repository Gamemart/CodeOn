-- Add foreign key constraint between bounties and profiles
ALTER TABLE public.bounties 
DROP CONSTRAINT IF EXISTS bounties_author_id_fkey;

ALTER TABLE public.bounties 
ADD CONSTRAINT bounties_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;