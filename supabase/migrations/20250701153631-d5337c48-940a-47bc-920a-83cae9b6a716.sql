
-- Create bounties table
CREATE TABLE public.bounties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  author_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bounty_tags table for tagging bounties
CREATE TABLE public.bounty_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id UUID REFERENCES public.bounties(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bounties
CREATE POLICY "Bounties are viewable by everyone" ON public.bounties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bounties" ON public.bounties
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own bounties" ON public.bounties
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own bounties" ON public.bounties
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for bounty_tags
CREATE POLICY "Bounty tags are viewable by everyone" ON public.bounty_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bounty tags" ON public.bounty_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bounties 
      WHERE bounties.id = bounty_tags.bounty_id 
      AND bounties.author_id = auth.uid()
    )
  );

-- Enable realtime for bounties tables
ALTER TABLE public.bounties REPLICA IDENTITY FULL;
ALTER TABLE public.bounty_tags REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bounties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bounty_tags;
