-- Add artwork_updated_at column to track when files are uploaded/updated
-- This helps operators identify orders with recently uploaded files

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS artwork_updated_at TIMESTAMP WITH TIME ZONE;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_artwork_updated_at 
ON orders(artwork_updated_at);

-- Update existing orders that have artwork_submitted_at but no artwork_updated_at
UPDATE orders 
SET artwork_updated_at = artwork_submitted_at 
WHERE artwork_submitted_at IS NOT NULL 
AND artwork_updated_at IS NULL;

-- Create a comment on the column
COMMENT ON COLUMN orders.artwork_updated_at IS 'Timestamp when artwork was last uploaded or updated by customer';
