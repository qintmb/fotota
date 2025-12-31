-- Create user_photo_actions table to track user interactions with photos
CREATE TABLE public.user_photo_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL, -- Path to the photo in storage
  action TEXT NOT NULL CHECK (action IN ('confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, photo_path)
);

-- Enable RLS
ALTER TABLE public.user_photo_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own photo actions"
  ON public.user_photo_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photo actions"
  ON public.user_photo_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo actions"
  ON public.user_photo_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_photo_actions_updated_at
  BEFORE UPDATE ON public.user_photo_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();