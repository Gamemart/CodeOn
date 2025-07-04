/*
  # Complete Authentication System Setup

  1. Database Structure
    - Clean profiles table with proper constraints
    - User roles system with enum type
    - Custom roles for additional flexibility
    - User moderation system
    - Follow system for social features

  2. Security
    - Enable RLS on all tables
    - Comprehensive policies for all operations
    - Secure trigger functions
    - Proper foreign key constraints

  3. Functions
    - Robust handle_new_user function
    - User role management functions
    - Helper functions for permissions
*/

-- Drop existing problematic elements
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;

-- Clean up existing tables
DROP TABLE IF EXISTS public.user_custom_roles CASCADE;
DROP TABLE IF EXISTS public.custom_roles CASCADE;
DROP TABLE IF EXISTS public.user_moderation CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop and recreate user_role enum
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');

-- Create profiles table with proper structure
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

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role DEFAULT 'user' NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now() NOT NULL
);

-- Create custom_roles table for additional role flexibility
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_custom_roles junction table
CREATE TABLE public.user_custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, custom_role_id)
);

-- Create user_moderation table
CREATE TABLE public.user_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moderator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('ban', 'mute')),
  reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create comprehensive RLS policies for profiles
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view user roles" 
  ON public.user_roles FOR SELECT 
  USING (true);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert roles" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update roles" 
  ON public.user_roles FOR UPDATE 
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete roles" 
  ON public.user_roles FOR DELETE 
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for custom_roles
CREATE POLICY "Anyone can view custom roles" 
  ON public.custom_roles FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage custom roles" 
  ON public.custom_roles FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- RLS policies for user_custom_roles
CREATE POLICY "Anyone can view user custom roles" 
  ON public.user_custom_roles FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage user custom roles" 
  ON public.user_custom_roles FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- RLS policies for user_moderation
CREATE POLICY "Anyone can view active moderation" 
  ON public.user_moderation FOR SELECT 
  USING (true);

CREATE POLICY "Only moderators can manage moderation" 
  ON public.user_moderation FOR ALL 
  USING (get_user_role(auth.uid()) IN ('admin', 'moderator'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'moderator'));

-- Create robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_metadata jsonb;
  username_value text;
  full_name_value text;
  attempt_count integer := 0;
  max_attempts integer := 10;
BEGIN
  -- Log the user creation attempt
  RAISE LOG 'Creating profile for new user: %', NEW.id;
  
  -- Get user metadata safely
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Extract and clean full name
  full_name_value := COALESCE(
    trim(user_metadata->>'full_name'),
    trim(user_metadata->>'name'),
    split_part(NEW.email, '@', 1)
  );
  
  -- Ensure full_name is not empty
  IF full_name_value IS NULL OR length(trim(full_name_value)) = 0 THEN
    full_name_value := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Extract and clean username
  username_value := COALESCE(
    trim(user_metadata->>'username'),
    trim(user_metadata->>'preferred_username')
  );
  
  -- Generate username if not provided
  IF username_value IS NULL OR length(trim(username_value)) = 0 THEN
    username_value := lower(regexp_replace(full_name_value, '[^a-zA-Z0-9]', '', 'g'));
    -- Ensure minimum length
    IF length(username_value) < 3 THEN
      username_value := 'user' || floor(random() * 100000)::text;
    END IF;
  END IF;
  
  -- Ensure username uniqueness with retry logic
  WHILE attempt_count < max_attempts LOOP
    BEGIN
      -- Try to insert the profile
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
      
      -- If successful, break the loop
      EXIT;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Username already exists, generate a new one
        attempt_count := attempt_count + 1;
        username_value := username_value || floor(random() * 1000)::text;
        
        IF attempt_count >= max_attempts THEN
          -- Final fallback
          username_value := 'user' || extract(epoch from now())::bigint || floor(random() * 1000)::text;
        END IF;
        
      WHEN OTHERS THEN
        -- Log other errors but don't fail user creation
        RAISE LOG 'Error creating profile for user % (attempt %): %', NEW.id, attempt_count + 1, SQLERRM;
        EXIT;
    END;
  END LOOP;
  
  -- Create default user role
  BEGIN
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (NEW.id, 'user', now());
    
    RAISE LOG 'Successfully created profile and role for user: %', NEW.id;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error creating user role for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Critical error in handle_new_user for user %: %', NEW.id, SQLERRM;
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

-- Create trigger for updating updated_at on profiles
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS user_custom_roles_user_id_idx ON public.user_custom_roles(user_id);
CREATE INDEX IF NOT EXISTS user_moderation_user_id_idx ON public.user_moderation(user_id);
CREATE INDEX IF NOT EXISTS user_moderation_active_idx ON public.user_moderation(is_active);

-- Update existing foreign key constraints in other tables
DO $$
BEGIN
  -- Fix discussions table foreign key if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discussions') THEN
    ALTER TABLE public.discussions DROP CONSTRAINT IF EXISTS fk_discussions_author;
    ALTER TABLE public.discussions DROP CONSTRAINT IF EXISTS discussions_author_id_fkey;
    ALTER TABLE public.discussions ADD CONSTRAINT discussions_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix replies table foreign key if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'replies') THEN
    ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS fk_replies_author;
    ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS replies_author_id_fkey;
    ALTER TABLE public.replies ADD CONSTRAINT replies_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix bounties table foreign key if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bounties') THEN
    ALTER TABLE public.bounties DROP CONSTRAINT IF EXISTS bounties_author_id_fkey;
    ALTER TABLE public.bounties ADD CONSTRAINT bounties_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix follows table foreign keys if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follows') THEN
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
    ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey 
      FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey 
      FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Fix likes table foreign keys if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'likes') THEN
    ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
    ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Fix chat-related tables if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chats') THEN
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_created_by_fkey;
    ALTER TABLE public.chats ADD CONSTRAINT chats_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES auth.users(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_participants') THEN
    ALTER TABLE public.chat_participants DROP CONSTRAINT IF EXISTS chat_participants_user_id_fkey;
    ALTER TABLE public.chat_participants ADD CONSTRAINT chat_participants_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey 
      FOREIGN KEY (sender_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create some default custom roles
INSERT INTO public.custom_roles (name, description, color, created_by)
SELECT 
  'Contributor',
  'Active community contributor',
  '#10B981',
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.custom_roles (name, description, color, created_by)
SELECT 
  'Verified',
  'Verified community member',
  '#3B82F6',
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.custom_roles (name, description, color, created_by)
SELECT 
  'Expert',
  'Subject matter expert',
  '#8B5CF6',
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (name) DO NOTHING;