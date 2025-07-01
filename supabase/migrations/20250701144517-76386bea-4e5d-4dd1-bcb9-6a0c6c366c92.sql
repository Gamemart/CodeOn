
-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Chat creators can update their chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view chat participants for their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add participants to chats they created" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add participants to their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in chats they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to chats they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Now drop the function
DROP FUNCTION IF EXISTS public.user_is_chat_participant(uuid);

-- Create new RLS policies without recursion
CREATE POLICY "Users can view chats they participate in" 
  ON public.chats 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE chat_id = chats.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" 
  ON public.chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat creators can update their chats" 
  ON public.chats 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view chat participants" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp 
      WHERE cp.chat_id = chat_participants.chat_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to their chats" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chats" 
  ON public.chat_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their chats" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.messages 
  FOR DELETE 
  USING (auth.uid() = sender_id);
