
-- Create chats table for individual and group chats
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, -- For group chats, null for direct messages
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_participants table for managing who's in each chat
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Create messages table for storing chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view chats they participate in" ON public.chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat creators can update their chats" ON public.chats
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants of chats they're in" ON public.chat_participants
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" ON public.chat_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chats" ON public.chat_participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in chats they participate in" ON public.messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to chats they participate in" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    chat_id IN (
      SELECT chat_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Enable realtime for all tables
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to get or create direct chat between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_chat(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_chat_id UUID;
  new_chat_id UUID;
BEGIN
  -- Look for existing direct chat between the two users
  SELECT c.id INTO existing_chat_id
  FROM public.chats c
  WHERE c.type = 'direct'
    AND c.id IN (
      SELECT cp1.chat_id 
      FROM public.chat_participants cp1
      WHERE cp1.user_id = auth.uid()
    )
    AND c.id IN (
      SELECT cp2.chat_id 
      FROM public.chat_participants cp2
      WHERE cp2.user_id = other_user_id
    )
  LIMIT 1;

  -- If chat exists, return it
  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;

  -- Create new direct chat
  INSERT INTO public.chats (type, created_by)
  VALUES ('direct', auth.uid())
  RETURNING id INTO new_chat_id;

  -- Add both users as participants
  INSERT INTO public.chat_participants (chat_id, user_id)
  VALUES 
    (new_chat_id, auth.uid()),
    (new_chat_id, other_user_id);

  RETURN new_chat_id;
END;
$$;
