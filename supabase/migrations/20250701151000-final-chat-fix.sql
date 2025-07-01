
-- Final fix for chat infinite recursion - complete policy rebuild

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to view their chats" ON public.chats;
DROP POLICY IF EXISTS "Allow authenticated users to create chats" ON public.chats;
DROP POLICY IF EXISTS "Allow chat creators to update chats" ON public.chats;
DROP POLICY IF EXISTS "Allow users to view participants in their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow users to join chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow chat creators to add participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow users to leave chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow users to view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Allow users to send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Allow users to update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to delete their own messages" ON public.messages;

-- Drop any existing function that might cause issues
DROP FUNCTION IF EXISTS public.user_is_chat_participant(uuid);

-- Create a security definer function to check if user is in a chat
CREATE OR REPLACE FUNCTION public.is_chat_member(chat_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chat_uuid AND user_id = user_uuid
  );
$$;

-- Create simple, non-recursive policies for chats
CREATE POLICY "chats_select_policy" 
  ON public.chats 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR
    public.is_chat_member(id, auth.uid())
  );

CREATE POLICY "chats_insert_policy" 
  ON public.chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "chats_update_policy" 
  ON public.chats 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create simple policies for chat_participants (no recursion)
CREATE POLICY "chat_participants_select_policy" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "chat_participants_insert_self_policy" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_participants_insert_creator_policy" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "chat_participants_delete_policy" 
  ON public.chat_participants 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create simple policies for messages
CREATE POLICY "messages_select_policy" 
  ON public.messages 
  FOR SELECT 
  USING (public.is_chat_member(chat_id, auth.uid()));

CREATE POLICY "messages_insert_policy" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "messages_update_policy" 
  ON public.messages 
  FOR UPDATE 
  USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_policy" 
  ON public.messages 
  FOR DELETE 
  USING (sender_id = auth.uid());
