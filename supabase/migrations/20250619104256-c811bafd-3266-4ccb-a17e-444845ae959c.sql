
-- Promote user @clio to admin role
-- First, let's find the user ID for @clio and set their role to admin
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  p.id as user_id,
  'admin'::user_role as role,
  p.id as assigned_by
FROM public.profiles p
WHERE p.username = 'clio'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin'::user_role,
  assigned_at = now();
