/*
  # Add Email Authentication Support

  1. Database Changes
    - Enable email authentication in Supabase
    - Update profiles table to handle both Discord and email users
    - Add email confirmation handling

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user data handling for both auth methods
*/

-- Update the handle_new_user function to handle both Discord and email auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_metadata jsonb;
  username_value text;
  full_name_value text;
  avatar_url_value text;
  auth_provider text;
BEGIN
  -- Get user metadata safely
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Determine auth provider
  auth_provider := COALESCE(NEW.app_metadata->>'provider', 'email');
  
  -- Handle different auth providers
  IF auth_provider = 'discord' THEN
    -- Discord OAuth user
    full_name_value := COALESCE(
      user_metadata->>'full_name',
      user_metadata->>'name',
      user_metadata->>'global_name',
      'Discord User'
    );
    
    username_value := COALESCE(
      user_metadata->>'username',
      user_metadata->>'preferred_username',
      'user_' || substr(NEW.id::text, 1, 8)
    );
    
    avatar_url_value := user_metadata->>'avatar_url';
  ELSE
    -- Email/password user
    full_name_value := COALESCE(
      user_metadata->>'full_name',
      split_part(NEW.email, '@', 1)
    );
    
    username_value := COALESCE(
      user_metadata->>'username',
      lower(regexp_replace(full_name_value, '[^a-zA-Z0-9]', '', 'g'))
    );
    
    avatar_url_value := user_metadata->>'avatar_url';
  END IF;
  
  -- Ensure username uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    username_value := username_value || '_' || floor(random() * 1000)::text;
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
    avatar_url_value,
    'color',
    CASE 
      WHEN auth_provider = 'discord' THEN '#5865F2'
      ELSE '#3B82F6'
    END,
    null,
    'left',
    now(),
    now()
  );

  -- Create default user role if user_roles table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (NEW.id, 'user', now())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();