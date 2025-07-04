/*
  # Add font preference to profiles

  1. New Columns
    - `font_family` (text) - stores the user's preferred font family
    
  2. Changes
    - Add font_family column to profiles table with default value
    - Add check constraint for valid font options
*/

-- Add font_family column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';

-- Add check constraint for valid font families
ALTER TABLE public.profiles 
ADD CONSTRAINT font_family_check 
CHECK (font_family IN (
  'Inter', 'Arial', 'Times New Roman', 'Georgia', 'Helvetica', 
  'Verdana', 'Trebuchet MS', 'Courier New', 'Palatino', 'Garamond',
  'Alice', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
));