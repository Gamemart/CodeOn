
-- Add new columns to profiles table for customization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_type text DEFAULT 'color' CHECK (banner_type IN ('color', 'gradient', 'image'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_value text DEFAULT '#3B82F6';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_message text;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create storage bucket for avatars and banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-media', 'profile-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Anyone can view profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile media" ON storage.objects;

CREATE POLICY "Anyone can view profile media" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'profile-media');

CREATE POLICY "Users can upload their own profile media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile media" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'profile-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile media" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'profile-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
