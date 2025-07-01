
-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate the trigger function to handle new user role creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::user_role)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Recreate the get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = user_uuid),
    'user'::user_role
  );
$$;

-- Add basic RLS policies for user_roles
DO $$ BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
  
  -- Create new policies
  CREATE POLICY "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);
  CREATE POLICY "Only admins can manage user roles" ON public.user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
EXCEPTION
  WHEN others THEN null;
END $$;
