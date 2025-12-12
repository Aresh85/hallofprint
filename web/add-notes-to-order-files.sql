-- Add notes column to order_files table to store customer upload instructions
-- This allows operators to see any special instructions the customer provided with their file

ALTER TABLE order_files 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create comment on the column
COMMENT ON COLUMN order_files.notes IS 'Customer notes or special instructions provided with file upload';
