
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Admins can manage custom roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Anyone can view user custom roles" ON public.user_custom_roles;
DROP POLICY IF EXISTS "Admins can manage user custom roles" ON public.user_custom_roles;

-- Add a function to get a user's custom role information
CREATE OR REPLACE FUNCTION public.get_user_custom_role(user_uuid uuid)
RETURNS TABLE(name text, color text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT cr.name, cr.color
  FROM public.user_custom_roles ucr
  JOIN public.custom_roles cr ON ucr.custom_role_id = cr.id
  WHERE ucr.user_id = user_uuid
  LIMIT 1;
$$;

-- Add RLS policies for custom roles tables
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;

-- Custom roles policies
CREATE POLICY "Anyone can view custom roles" 
  ON public.custom_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage custom roles" 
  ON public.custom_roles 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- User custom roles policies  
CREATE POLICY "Anyone can view user custom roles" 
  ON public.user_custom_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage user custom roles" 
  ON public.user_custom_roles 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');
