-- Add tax_rate column to order_sundries table
ALTER TABLE order_sundries 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 20.00;

-- Add comment explaining the column
COMMENT ON COLUMN order_sundries.tax_rate IS 'Tax rate percentage for this sundry (e.g., 0.00, 5.00, 20.00)';
