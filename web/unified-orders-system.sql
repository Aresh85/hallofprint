-- Migration: Unified Orders System - Quotes ARE Orders
-- This expands the orders table to handle quotes as early-stage orders
-- After this migration, new quotes will be created directly in the orders table

-- ============================================
-- PART 1: Expand Orders Table
-- ============================================

-- Add order type to distinguish quotes from direct orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'standard' 
  CHECK (order_type IN ('quote', 'standard', 'price_match'));

-- Add quote-specific timestamps
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS quote_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_priced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ;

-- Add quote/project details fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS project_title TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS quantity TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Add price match fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS price_match_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS competitor_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS competitor_url TEXT;

-- Add customer fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add request fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS company_account_requested BOOLEAN DEFAULT FALSE;

-- Add operator/workflow fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS operator_assigned TEXT,
ADD COLUMN IF NOT EXISTS delivery_time_estimate TEXT,
ADD COLUMN IF NOT EXISTS tax_applicable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_type TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add file URLs for quote submissions
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS file_urls TEXT[]; -- Array of file URLs


-- ============================================
-- PART 2: Update Status Values
-- ============================================

-- Current statuses: pending, processing, dispatched, cancelled
-- New quote statuses to add:
-- - quote_pending: Quote just submitted, awaiting review
-- - quote_reviewed: Being worked on by operator  
-- - quote_priced: Price provided, awaiting customer acceptance
-- - quote_accepted: Customer accepted, awaiting payment

-- No schema change needed - status field already exists as TEXT


-- ============================================
-- PART 3: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_status_type ON orders(status, order_type);
CREATE INDEX IF NOT EXISTS idx_orders_quote_submitted ON orders(quote_submitted_at) WHERE order_type = 'quote';


-- ============================================
-- PART 4: Archive Existing Quote Requests
-- ============================================

-- Rename quote_requests to quote_requests_archive
-- This preserves the data but stops us from using the table
ALTER TABLE IF EXISTS quote_requests RENAME TO quote_requests_archive;

-- Add comment
COMMENT ON TABLE quote_requests_archive IS 'ARCHIVED: Historical quote requests before unified system. New quotes go directly to orders table.';


-- ============================================
-- PART 5: Update RLS Policies
-- ============================================

-- Users can view their own orders (including quotes)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view guest orders by email
DROP POLICY IF EXISTS "Users can view guest orders by email" ON orders;
CREATE POLICY "Users can view guest orders by email" ON orders
  FOR SELECT
  USING (guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()));


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN (
    'order_type', 'quote_submitted_at', 'project_title', 
    'competitor_price', 'operator_assigned', 'file_urls'
  )
ORDER BY column_name;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
  AND indexname LIKE '%quote%';

-- Count orders by type
SELECT 
  order_type,
  COUNT(*) as count
FROM orders
GROUP BY order_type;

-- Show quote_requests_archive exists
SELECT tablename 
FROM pg_tables 
WHERE tablename = 'quote_requests_archive';
