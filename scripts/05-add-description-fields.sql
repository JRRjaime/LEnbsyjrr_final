-- Add description field to photos and videos tables
ALTER TABLE photos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
