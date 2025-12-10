-- Fix existing orders by adding user_id based on customer_email
-- This allows orders to show up in /account/orders

-- Update orders with user_id from user_profiles
UPDATE orders o
SET user_id = up.id
FROM user_profiles up
WHERE o.customer_email = up.email
  AND o.user_id IS NULL;

-- Verify the updates
SELECT 
  order_number,
  customer_email,
  user_id,
  created_at
FROM orders
WHERE customer_email = 'aresh@inteeka.com'
ORDER BY created_at DESC;
