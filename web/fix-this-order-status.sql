-- Fix the status for your specific price match order
-- Run this in Supabase SQL Editor

UPDATE orders 
SET status = 'pending'
WHERE order_number = 'QT-1765400455569-6FB8D'
AND order_type = 'price_match';

-- Verify it worked
SELECT id, order_number, order_type, status 
FROM orders 
WHERE order_number = 'QT-1765400455569-6FB8D';
