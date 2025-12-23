-- Add profile_photo_url column to profiles table for user avatar
ALTER TABLE public.profiles ADD COLUMN profile_photo_url TEXT;

-- Update RLS policies to include the new column (policies don't need changes as they use SELECT *)
-- But let's ensure the policies cover all columns
