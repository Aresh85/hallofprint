-- VERIFY: Check if profile was created

-- Step 1: Check what user ID you're logged in as
-- (Look at the console logs for the user ID in the fetch.ts:17 error URL)
-- It should be: 11a1dd1e-a16a-469b-8d5b-70bf6b68d81a

-- Step 2: Check if profile exists for that user ID
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.created_at,
  au.email as auth_email
FROM user_profiles up
FULL OUTER JOIN auth.users au ON up.id = au.id
WHERE au.email = 'aresh@inteeka.com' OR up.email = 'aresh@inteeka.com';

-- If the above shows user_profiles columns as NULL, then the profile wasn't created
-- Run this to create it:

INSERT INTO user_profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '11a1dd1e-a16a-469b-8d5b-70bf6b68d81a',  -- Your user ID from console
  'aresh@inteeka.com',
  'Aresh Amo',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  email = 'aresh@inteeka.com',
  updated_at = NOW();

-- Step 3: Verify again
SELECT id, email, full_name, role, created_at
FROM user_profiles 
WHERE id = '11a1dd1e-a16a-469b-8d5b-70bf6b68d81a';

-- Should show: role = 'admin'

-- IMPORTANT: After running this, you MUST:
-- 1. Click "Sign Out" on the website
-- 2. Close all browser tabs  
-- 3. Open new tab and login again
-- 4. Test /admin/orders again
