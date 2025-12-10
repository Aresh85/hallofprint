-- Add delivery_date column to orders table for quote delivery scheduling

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;

-- Add tax_rate column to store the tax rate applied (default 20%)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 20.00;

-- Add tax_included column to track if tax should be applied
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tax_included BOOLEAN DEFAULT true;

-- Add quote_response_notes column for operator's response to customer
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS quote_response_notes TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('delivery_date', 'tax_rate', 'tax_included', 'quote_response_notes');
