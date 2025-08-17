-- Separate script for storage setup
-- Create storage bucket for photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON photos;
DROP POLICY IF EXISTS "Anyone can upload photos" ON photos;
DROP POLICY IF EXISTS "Anyone can delete photos" ON photos;

-- Create RLS policies for photos table
CREATE POLICY "Public photos are viewable by everyone" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Anyone can upload photos" ON photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete photos" ON photos
  FOR DELETE USING (true);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete photos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public photos are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos');
