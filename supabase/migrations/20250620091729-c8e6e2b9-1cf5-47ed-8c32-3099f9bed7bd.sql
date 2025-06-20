
-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view their chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add participants to chats they created" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;

-- Enable RLS on tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check chat participation
CREATE OR REPLACE FUNCTION public.user_is_chat_participant(chat_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chat_uuid AND user_id = auth.uid()
  );
$$;

-- Create RLS policies for chats
CREATE POLICY "Users can view chats they participate in" 
  ON public.chats 
  FOR SELECT 
  USING (public.user_is_chat_participant(id));

CREATE POLICY "Users can create chats" 
  ON public.chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for chat_participants
CREATE POLICY "Users can view chat participants for their chats" 
  ON public.chat_participants 
  FOR SELECT 
  USING (public.user_is_chat_participant(chat_id));

CREATE POLICY "Users can add participants to chats they created" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND created_by = auth.uid()
    )
  );

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their chats" 
  ON public.messages 
  FOR SELECT 
  USING (public.user_is_chat_participant(chat_id));

CREATE POLICY "Users can send messages to their chats" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND 
    public.user_is_chat_participant(chat_id)
  );

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
