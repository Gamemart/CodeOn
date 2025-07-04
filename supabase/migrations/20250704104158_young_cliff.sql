/*
  # Reset Authentication System

  1. Security
    - Remove all existing users and profiles
    - Reset authentication system
    - Clean up any orphaned data
  
  2. Database Cleanup
    - Delete all user-related data
    - Reset auto-increment sequences
    - Clean up storage buckets
  
  3. Fresh Start
    - Prepare system for new user registrations
    - Ensure all triggers and functions work correctly
*/

-- First, disable RLS temporarily to allow cleanup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bounties DISABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Delete all user-generated content (in correct order to respect foreign keys)
DELETE FROM messages;
DELETE FROM chat_participants;
DELETE FROM chats;
DELETE FROM follows;
DELETE FROM bounty_tags;
DELETE FROM bounties;
DELETE FROM discussion_tags;
DELETE FROM likes;
DELETE FROM replies;
DELETE FROM discussions;
DELETE FROM profiles;

-- Clean up auth.users table (this will cascade to remove all user sessions)
DELETE FROM auth.users;

-- Reset any sequences if they exist
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.schemaname || '.' || seq_record.sequencename || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Clean up storage buckets if they exist
DO $$
BEGIN
    -- Delete all objects from profile-media bucket
    DELETE FROM storage.objects WHERE bucket_id = 'profile-media';
EXCEPTION
    WHEN OTHERS THEN
        -- Bucket might not exist, ignore error
        NULL;
END $$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Ensure the handle_new_user function is working correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user with better error handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify all RLS policies are in place
-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Discussions policies
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON discussions;
DROP POLICY IF EXISTS "Users can delete their own discussions" ON discussions;

CREATE POLICY "Discussions are viewable by everyone"
  ON discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own discussions"
  ON discussions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions FOR DELETE
  USING (auth.uid() = author_id);

-- Replies policies
DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON replies;
DROP POLICY IF EXISTS "Users can delete their own replies" ON replies;

CREATE POLICY "Replies are viewable by everyone"
  ON replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies"
  ON replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies"
  ON replies FOR DELETE
  USING (auth.uid() = author_id);

-- Likes policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Bounties policies
DROP POLICY IF EXISTS "Bounties are viewable by everyone" ON bounties;
DROP POLICY IF EXISTS "Authenticated users can create bounties" ON bounties;
DROP POLICY IF EXISTS "Users can update their own bounties" ON bounties;
DROP POLICY IF EXISTS "Users can delete their own bounties" ON bounties;

CREATE POLICY "Bounties are viewable by everyone"
  ON bounties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create bounties"
  ON bounties FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own bounties"
  ON bounties FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own bounties"
  ON bounties FOR DELETE
  USING (auth.uid() = author_id);

-- Follows policies
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;

CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);