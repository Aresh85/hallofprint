-- FIX: Row Level Security blocking user_profiles reads

-- Problem: Profile exists but RLS policies prevent reading it
-- Error: PGRST116 - The result contains 0 rows

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Step 2: Check existing policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Step 3: Drop ALL existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;

-- Step 4: Enable RLS (if not already)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create CORRECT policies

-- Allow users to read their OWN profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their OWN profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to INSERT their profile (for signup)
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 6: Verify policies are created
SELECT policyname, permissive, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Step 7: Test the SELECT query that's failing
-- This should NOW return your profile:
SELECT id, email, role
FROM user_profiles
WHERE id = auth.uid();

-- Expected result:
-- id: 11a1dd1e-a16a-469b-8d5b-70bf6b68d81a
-- email: aresh@inteeka.com
-- role: admin
