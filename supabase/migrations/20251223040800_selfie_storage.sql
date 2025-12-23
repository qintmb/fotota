-- Create user_selfies table
CREATE TABLE public.user_selfies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS on user_selfies
ALTER TABLE public.user_selfies ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_selfies
CREATE POLICY "user access own selfie"
  ON public.user_selfies
  FOR ALL
  USING (auth.uid() = user_id);

-- Create storage bucket for user selfies
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-selfies', 'user-selfies', false);

-- Create storage policy for user-selfies bucket
CREATE POLICY "Users can upload their own selfies"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own selfies"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'user-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own selfies"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own selfies"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);