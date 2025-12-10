-- Add file_updated_at column to track when customers update their artwork files
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS file_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.file_updated_at IS 'Timestamp when customer last updated artwork files';

-- Check the column was added successfully
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'file_updated_at';
