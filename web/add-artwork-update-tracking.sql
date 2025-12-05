-- Add columns to track artwork file updates
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS artwork_updated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS artwork_updated_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN orders.artwork_updated IS 'Indicates if the artwork file was replaced/updated';
COMMENT ON COLUMN orders.artwork_updated_at IS 'Timestamp of when artwork was last updated';
