
-- Update storage policies to allow discussion image uploads
DROP POLICY IF EXISTS "Users can upload their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile media" ON storage.objects;

-- Create new policies that allow both profile media and discussion images
CREATE POLICY "Users can upload their own profile media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-media' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      (storage.foldername(name))[1] = 'discussions'
    )
  );

CREATE POLICY "Users can update their own profile media" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'profile-media' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      (storage.foldername(name))[1] = 'discussions'
    )
  );

CREATE POLICY "Users can delete their own profile media" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'profile-media' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      (storage.foldername(name))[1] = 'discussions'
    )
  );
