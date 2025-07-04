/*
  # Remove Admin Dashboard Functionality

  1. Tables to Remove
    - `user_roles` - User role assignments
    - `custom_roles` - Custom role definitions  
    - `user_custom_roles` - User custom role assignments
    - `user_moderation` - User moderation actions

  2. Functions to Remove
    - `get_user_role` - Get user role function
    - `get_user_custom_role` - Get user custom role function
    - `is_user_moderated` - Check if user is moderated

  3. Enum to Remove
    - `user_role` - User role enum

  4. Triggers to Remove
    - `handle_new_user_role` - Handle new user role trigger function
*/

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS user_custom_roles CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;
DROP TABLE IF EXISTS user_moderation CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS get_user_custom_role(uuid);
DROP FUNCTION IF EXISTS is_user_moderated(uuid, text);

-- Drop trigger functions
DROP FUNCTION IF EXISTS handle_new_user_role() CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS user_role CASCADE;