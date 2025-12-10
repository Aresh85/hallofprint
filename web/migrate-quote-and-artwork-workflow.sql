-- Migration: Simplify Quote and Artwork Workflow
-- 1. Add address & price match fields to quote_requests
-- 2. Add order_id to artwork_submissions (for order-specific uploads)

-- ============================================
-- PART 1: Enhance Quote Requests Table
-- ============================================

-- Add address fields
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United Kingdom';

-- Add enhanced price match fields
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS competitor_price DECIMAL(10,2);

-- competitor_url already exists, no need to modify

-- Update existing records to have default country
UPDATE quote_requests 
SET country = 'United Kingdom' 
WHERE country IS NULL;

COMMENT ON COLUMN quote_requests.competitor_price IS 'Competitor price excluding VAT for price match requests';
COMMENT ON COLUMN quote_requests.address_line1 IS 'Delivery address line 1';


-- ============================================
-- PART 2: Update Artwork Submissions Table
-- ============================================

-- Add order_id column for linking artwork to existing orders
ALTER TABLE artwork_submissions 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_artwork_submissions_order_id ON artwork_submissions(order_id);

-- Update RLS policy for order-based artwork
CREATE POLICY "Users can view artwork for their orders" ON artwork_submissions
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM orders WHERE orders.id = artwork_submissions.order_id
        )
    );

COMMENT ON COLUMN artwork_submissions.order_id IS 'Link to existing order for order-specific artwork uploads';
COMMENT ON COLUMN artwork_submissions.converted_order_id IS 'Legacy: Order created from standalone artwork (no longer used)';


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check quote_requests columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quote_requests' 
  AND column_name IN ('address_line1', 'city', 'postcode', 'country', 'competitor_price', 'competitor_url')
ORDER BY column_name;

-- Check artwork_submissions columns  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'artwork_submissions'
  AND column_name IN ('order_id', 'converted_order_id')
ORDER BY column_name;
