-- Fix storage policies for profile-media bucket to allow discussion image uploads

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can upload their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile media" ON storage.objects;

-- Create more permissive policies for authenticated users to upload discussion images
CREATE POLICY "Authenticated users can upload to profile-media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update their own uploads" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'profile-media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete their own uploads" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'profile-media' AND 
    auth.role() = 'authenticated'
  );