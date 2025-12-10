-- Add stripe_payment_url column to orders table
-- This stores the Stripe Checkout Session URL for customers to pay

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_url TEXT;

-- Add comment
COMMENT ON COLUMN orders.stripe_payment_url IS 'Stripe Checkout Session URL for customer payment';
