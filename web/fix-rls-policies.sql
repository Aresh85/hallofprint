-- Fix RLS Policies to avoid infinite recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Operators can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Operators can view all orders" ON orders;
DROP POLICY IF EXISTS "Operators can view all order items" ON order_items;

-- Recreate user_profiles policies without recursion
-- Users can still view and update their own profile
-- Operators will use service role for admin operations

-- For orders - fix the operator policy
CREATE POLICY "Operators and admins can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('operator', 'admin')
    )
  );

-- For order_items - fix the operator policy  
CREATE POLICY "Operators and admins can view all order items" ON order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('operator', 'admin')
    )
  );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_addresses TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;
