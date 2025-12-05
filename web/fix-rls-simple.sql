-- SIMPLE FIX: Allow authenticated users to read all profiles
-- Needed because admins need to check roles of all users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to READ all profiles
-- (Needed for admin role checks)
CREATE POLICY "Allow authenticated read all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to UPDATE only their own profile
CREATE POLICY "Users update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to INSERT only their own profile
CREATE POLICY "Users insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Test: This should NOW return your profile
SELECT id, email, role
FROM user_profiles
WHERE email = 'aresh@inteeka.com';

-- Should show:
-- email: aresh@inteeka.com
-- role: admin
