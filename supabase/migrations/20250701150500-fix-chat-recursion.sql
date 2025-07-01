
-- Fix infinite recursion in chat RLS policies by simplifying them

-- Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Chat creators can update their chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add participants to their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create simple, non-recursive policies for chats
CREATE POLICY "Allow authenticated users to view their chats" 
  ON public.chats 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT DISTINCT chat_id 
      FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to create chats" 
  ON public.chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow chat creators to update chats" 
  ON public.chats 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create simple policies for chat_participants
CREATE POLICY "Allow users to view participants in their chats" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    chat_id IN (
      SELECT DISTINCT cp.chat_id 
      FROM public.chat_participants cp 
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to join chats" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow chat creators to add participants" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (
    chat_id IN (
      SELECT id FROM public.chats 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Allow users to leave chats" 
  ON public.chat_participants 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create simple policies for messages
CREATE POLICY "Allow users to view messages in their chats" 
  ON public.messages 
  FOR SELECT 
  USING (
    chat_id IN (
      SELECT DISTINCT chat_id 
      FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to send messages to their chats" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    chat_id IN (
      SELECT DISTINCT chat_id 
      FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (sender_id = auth.uid());

CREATE POLICY "Allow users to delete their own messages" 
  ON public.messages 
  FOR DELETE 
  USING (sender_id = auth.uid());
