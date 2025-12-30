-- Create FOTO bucket for photo storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('FOTO', 'FOTO', false);

-- Create storage policies for FOTO bucket
-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view FOTO files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'FOTO');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to FOTO"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'FOTO');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update FOTO files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'FOTO');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete FOTO files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'FOTO');