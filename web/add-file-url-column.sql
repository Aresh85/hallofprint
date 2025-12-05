-- Add the missing file_url column to artwork_submissions table
ALTER TABLE artwork_submissions 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artwork_submissions';
