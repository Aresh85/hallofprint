-- Fix: Create missing user profile for aresh@inteeka.com
-- Problem: User exists in auth.users but not in public.user_profiles

-- Step 1: Check if profile exists
SELECT 
  id,
  email,
  role
FROM user_profiles 
WHERE email = 'aresh@inteeka.com';

-- If the above returns NO ROWS, then run this:

-- Step 2: Insert the missing profile with admin role
INSERT INTO user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Aresh Amo') as full_name,
  'admin' as role,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'aresh@inteeka.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    updated_at = NOW();

-- Step 3: Verify it worked
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM user_profiles 
WHERE email = 'aresh@inteeka.com';

-- You should now see: role = 'admin'

-- Step 4: After running this, LOGOUT and LOGIN again on the website!
