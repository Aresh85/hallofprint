-- Fix: Update orders status check constraint to include quote statuses
-- The current constraint only allows certain status values
-- We need to add quote_pending, quote_reviewed, quote_priced, quote_accepted

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with quote statuses included
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    -- Quote statuses
    'quote_pending',
    'quote_reviewed', 
    'quote_priced',
    'quote_accepted',
    -- Regular order statuses
    'pending',
    'processing',
    'completed',
    'dispatched',
    'cancelled'
  ));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'orders_status_check';
