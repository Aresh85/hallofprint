-- Add delivery contact fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_contact_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.delivery_contact_name IS 'Name of person to contact for delivery';
COMMENT ON COLUMN orders.delivery_contact_number IS 'Phone number of person to contact for delivery';
