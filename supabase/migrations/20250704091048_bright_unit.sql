-- Add font_family column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';

-- Add check constraint for valid font families
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'font_family_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT font_family_check 
    CHECK (font_family IN (
      'Inter', 'Arial', 'Times New Roman', 'Georgia', 'Helvetica', 
      'Verdana', 'Trebuchet MS', 'Courier New', 'Palatino', 'Garamond',
      'Alice', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
    ));
  END IF;
END $$;