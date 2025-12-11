-- IMPORTANT: Run add-tax-rate-to-sundries.sql FIRST before running this!

-- This updates ALL existing sundries to have a tax_rate of 20%
-- If you need specific sundries to have 0% or 5%, you'll need to update them individually

-- Update all existing sundries to have 20% tax rate (Standard VAT)
UPDATE order_sundries 
SET tax_rate = 20.00 
WHERE tax_rate IS NULL;

-- If you need to set specific sundries to 0% VAT, use something like:
-- UPDATE order_sundries 
-- SET tax_rate = 0.00 
-- WHERE description = 'Some specific description' AND tax_rate IS NULL;

-- Check the results
SELECT id, description, total_price, tax_rate 
FROM order_sundries 
ORDER BY created_at DESC 
LIMIT 20;
