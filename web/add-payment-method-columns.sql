-- Add ALL missing payment-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method_brand TEXT,
ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN orders.stripe_payment_url IS 'Stripe Checkout Session URL for customer payment';
COMMENT ON COLUMN orders.payment_method_brand IS 'Card brand (visa, mastercard, etc)';
COMMENT ON COLUMN orders.payment_method_last4 IS 'Last 4 digits of payment card';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was completed';

-- Update existing paid orders to show as paid (for orders that were paid via Stripe)
UPDATE orders
SET 
  payment_status = 'paid',
  paid_at = NOW(),
  status = CASE 
    WHEN status = 'quote_priced' THEN 'processing'
    ELSE status
  END
WHERE stripe_payment_intent_id IS NOT NULL
  AND stripe_payment_intent_id != ''
  AND (payment_status IS NULL OR payment_status != 'paid');

-- Check the results
SELECT 
  order_number,
  status,
  payment_status,
  paid_at,
  stripe_payment_intent_id,
  payment_method_brand,
  payment_method_last4
FROM orders
WHERE stripe_payment_intent_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
