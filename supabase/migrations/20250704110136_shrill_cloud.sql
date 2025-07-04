/*
  # Rebuild Authentication System

  1. Clean up existing auth-related tables and functions
  2. Create proper profiles table with correct constraints
  3. Set up proper RLS policies
  4. Create trigger function for new user profile creation
  5. Set up proper indexes and constraints

  This migration rebuilds the entire auth system to ensure reliability.
*/

-- Drop existing problematic constraints and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Clean up profiles table constraints
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Recreate profiles table with proper structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  banner_type text DEFAULT 'color' CHECK (banner_type IN ('color', 'gradient', 'image')),
  banner_value text DEFAULT '#3B82F6',
  status_message text,
  profile_alignment text DEFAULT 'left' CHECK (profile_alignment IN ('left', 'center', 'right')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_metadata jsonb;
  username_value text;
  full_name_value text;
BEGIN
  -- Get user metadata
  user_metadata := NEW.raw_user_meta_data;
  
  -- Extract values from metadata with fallbacks
  full_name_value := COALESCE(
    user_metadata->>'full_name',
    user_metadata->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  username_value := COALESCE(
    user_metadata->>'username',
    user_metadata->>'preferred_username',
    lower(regexp_replace(full_name_value, '[^a-zA-Z0-9]', '', 'g')) || floor(random() * 10000)::text
  );

  -- Ensure username is unique by appending numbers if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    username_value := username_value || floor(random() * 1000)::text;
  END LOOP;

  -- Insert the new profile
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    banner_type,
    banner_value,
    status_message,
    profile_alignment,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    username_value,
    full_name_value,
    user_metadata->>'avatar_url',
    'color',
    '#3B82F6',
    null,
    'left',
    now(),
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Update existing foreign key constraints in other tables to reference profiles properly
DO $$
BEGIN
  -- Fix discussions table foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussions') THEN
    ALTER TABLE public.discussions DROP CONSTRAINT IF EXISTS fk_discussions_author;
    ALTER TABLE public.discussions DROP CONSTRAINT IF EXISTS discussions_author_id_fkey;
    ALTER TABLE public.discussions ADD CONSTRAINT discussions_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix replies table foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replies') THEN
    ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS fk_replies_author;
    ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS replies_author_id_fkey;
    ALTER TABLE public.replies ADD CONSTRAINT replies_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix bounties table foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bounties') THEN
    ALTER TABLE public.bounties DROP CONSTRAINT IF EXISTS bounties_author_id_fkey;
    ALTER TABLE public.bounties ADD CONSTRAINT bounties_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;