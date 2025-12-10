-- Add paid_at column to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Update the current quote to link to the order
UPDATE quote_requests 
SET 
  order_id = '79ca92ad-2570-4143-a97c-59d5cec9c03e',
  status = 'converted_to_order',
  converted_at = NOW(),
  paid_at = NOW()
WHERE id = '45e52176-3ed5-4336-b733-47decf53cb5e';

-- Verify the update
SELECT 
  id,
  project_title,
  status,
  order_id,
  paid_at,
  converted_at
FROM quote_requests 
WHERE id = '45e52176-3ed5-4336-b733-47decf53cb5e';
