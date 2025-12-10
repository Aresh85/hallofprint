-- Add payment method columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method_brand TEXT,
ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT;

-- Update existing paid orders to show as paid (for orders that were paid via Stripe)
-- Replace 'YOUR_ORDER_ID' with the actual order ID from the screenshot
UPDATE orders
SET 
  payment_status = 'paid',
  paid_at = NOW(),
  status = 'processing'
WHERE stripe_payment_intent_id IS NOT NULL
  AND stripe_payment_intent_id != ''
  AND payment_status != 'paid';

-- Check the results
SELECT 
  order_number,
  payment_status,
  paid_at,
  stripe_payment_intent_id,
  payment_method_brand,
  payment_method_last4
FROM orders
WHERE stripe_payment_intent_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
