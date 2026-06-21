-- Run this SQL in your Supabase SQL Editor to create a table for Noor's memory

CREATE TABLE public.noor_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Optional: link to your Firebase Auth UID
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.noor_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (Example: users can only see and insert their own messages)
-- We assume anonymous users can also use it for simple testing (update this for production!)
CREATE POLICY "Allow public read access" ON public.noor_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.noor_messages FOR INSERT WITH CHECK (true);

-- Create an index to quickly load the latest chat history
CREATE INDEX noor_messages_created_at_idx ON public.noor_messages(created_at DESC);
