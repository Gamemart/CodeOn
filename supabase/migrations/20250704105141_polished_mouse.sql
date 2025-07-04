/*
  # Fix signup database error

  1. Database Issues
    - Fix foreign key constraints in profiles table
    - Ensure proper user creation flow
    - Add missing trigger function for new user creation

  2. Security
    - Maintain RLS policies
    - Ensure proper user data handling
*/

-- First, let's check if the profiles table has the correct foreign key
-- and fix any issues with the user creation process

-- Drop existing foreign key if it exists and recreate it properly
DO $$
BEGIN
  -- Check if the foreign key exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', NULL),
    COALESCE(new.raw_user_meta_data->>'full_name', NULL),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Enable insert for users based on user_id" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure the profiles table has proper defaults
ALTER TABLE profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE profiles ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE profiles ALTER COLUMN banner_type SET DEFAULT 'color';
ALTER TABLE profiles ALTER COLUMN banner_value SET DEFAULT '#3B82F6';
ALTER TABLE profiles ALTER COLUMN profile_alignment SET DEFAULT 'left';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON profiles(full_name);