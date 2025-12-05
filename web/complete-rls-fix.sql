-- COMPLETE FIX for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily to clean up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Operators can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Operators can view all orders" ON orders;
DROP POLICY IF EXISTS "Operators and admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Operators can view all order items" ON order_items;
DROP POLICY IF EXISTS "Operators and admins can view all order items" ON order_items;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE policies without recursion

-- user_profiles: Users can only manage their own profile
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- user_addresses: Users manage their own
CREATE POLICY "user_addresses_all" ON user_addresses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_preferences: Users manage their own  
CREATE POLICY "user_preferences_all" ON user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- orders: Users view their own
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- order_items: Users view their own through order relationship
CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_addresses TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_items TO authenticated;

-- Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_addresses', 'user_preferences', 'orders', 'order_items')
ORDER BY tablename, policyname;
