-- Add new fields to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS operator_assigned VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_time_estimate VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_applicable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMP WITH TIME ZONE;

-- Add comment with tax rules for operators
COMMENT ON COLUMN quote_requests.tax_type IS 'Tax rules: UK VAT (20%) applies to UK customers. EU customers provide VAT number for reverse charge. Non-EU customers: no VAT.';
