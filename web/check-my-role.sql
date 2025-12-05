-- Check your current role
-- Replace 'your@email.com' with YOUR actual email address

SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM user_profiles
WHERE email = 'your@email.com';

-- If role is NULL or 'customer', run this to make yourself admin:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Then LOGOUT and LOGIN again for the change to take effect!
