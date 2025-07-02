
-- Remove the conflicting and redundant INSERT policies on discussions table
DROP POLICY IF EXISTS "Allow all authenticated users to insert" ON public.discussions;
DROP POLICY IF EXISTS "Allow users to insert their own discussions" ON public.discussions;

-- Keep only the main policy that allows authenticated users to create discussions
-- The "Authenticated users can create discussions" policy should remain as it properly checks auth.uid() = author_id

-- Also ensure the discussion_tags policies are correct
DROP POLICY IF EXISTS "Authenticated users can create discussion tags" ON public.discussion_tags;

-- Recreate the discussion_tags policy to be more permissive
CREATE POLICY "Users can create discussion tags" ON public.discussion_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.discussions 
      WHERE discussions.id = discussion_tags.discussion_id 
      AND discussions.author_id = auth.uid()
    )
  );

-- Add policy to allow users to delete discussion tags for their own discussions
CREATE POLICY "Users can delete their discussion tags" ON public.discussion_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.discussions 
      WHERE discussions.id = discussion_tags.discussion_id 
      AND discussions.author_id = auth.uid()
    )
  );
