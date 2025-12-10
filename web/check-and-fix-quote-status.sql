-- Check the current status of quote/price_match orders
SELECT id, order_number, order_type, status, created_at 
FROM orders 
WHERE (order_type = 'quote' OR order_type = 'price_match')
ORDER BY created_at DESC
LIMIT 10;

-- If your order shows a status other than 'pending', run this to fix it:
-- Replace 'YOUR_ORDER_NUMBER' with your actual order number (e.g., QT-1765398958536-3THWT)

UPDATE orders 
SET status = 'pending'
WHERE order_number = 'QT-1765398958536-3THWT'
AND (order_type = 'quote' OR order_type = 'price_match')
AND status NOT IN ('quote_priced', 'quote_accepted', 'cancelled');

-- Verify the update
SELECT id, order_number, order_type, status 
FROM orders 
WHERE order_number = 'QT-1765398958536-3THWT';
